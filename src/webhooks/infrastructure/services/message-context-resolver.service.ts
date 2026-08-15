import { Inject, Injectable, Logger } from '@nestjs/common';
import { UniqueConstraintViolationException } from '@mikro-orm/core';
import { assertCustomerUniqueForUser } from '@customers/application/assert-customer-unique';
import { Customer } from '@customers/domain/aggregates';
import { CustomerSource } from '@customers/domain/enums';
import { CustomerAlreadyExistsException } from '@customers/domain/exceptions';
import type { ICustomerRepository } from '@customers/domain/repositories';
import { CUSTOMER_REPOSITORY } from '@customers/domain/tokens';
import { CustomerStatusEnum } from '@customers/domain/value-objects';
import { MessageChannel, MessageSender } from '@messages/domain/enums';
import type { UserIntegration } from '@users/domain/aggregates';
import { IntegrationProviderEnum } from '@users/domain/enums';
import type { IUserIntegrationRepository } from '@users/domain/repositories';
import { USER_INTEGRATION_REPOSITORY } from '@users/domain/tokens';
import type { InstagramSettings, WhatsAppSettings } from '@users/domain/types';

const PHONE_REGEX = /^\+?[0-9]{7,15}$/;
const MAX_NAME_LENGTH = 100;

export type ResolveMessageContextInput = {
  channel: MessageChannel;
  provider: IntegrationProviderEnum;
  senderId: string;
  recipientId: string;
  businessAccountIds: string[];
  isEcho: boolean;
  customerDisplayName?: string;
};

export type ResolvedMessageContext = {
  trainerId: string;
  customer: Customer;
  sender: MessageSender;
  integration: UserIntegration;
};

@Injectable()
export class MessageContextResolver {
  private readonly logger = new Logger(MessageContextResolver.name);

  constructor(
    @Inject(USER_INTEGRATION_REPOSITORY)
    private readonly userIntegrationRepository: IUserIntegrationRepository,
    @Inject(CUSTOMER_REPOSITORY)
    private readonly customerRepository: ICustomerRepository,
  ) {}

  async resolve(
    input: ResolveMessageContextInput,
  ): Promise<ResolvedMessageContext | null> {
    const integration =
      await this.userIntegrationRepository.findUsableByProviderAndAccountIds(
        input.provider,
        input.businessAccountIds,
      );

    if (!integration) {
      this.logger.warn(
        `No usable ${input.provider} integration for account ids ${input.businessAccountIds.join(', ')}`,
      );
      return null;
    }

    const trainerAccountIds = collectTrainerAccountIds(integration);
    const sender = this.detectSender(input, trainerAccountIds);
    const customerExternalId =
      sender === MessageSender.TRAINER ? input.recipientId : input.senderId;

    if (!customerExternalId || trainerAccountIds.has(customerExternalId)) {
      this.logger.warn(
        `Cannot resolve customer identity for ${input.channel} message on trainer ${integration.userId.value}`,
      );
      return null;
    }

    const customer = await this.findOrCreateCustomer({
      trainerId: integration.userId.value,
      channel: input.channel,
      customerExternalId,
      displayName: input.customerDisplayName,
    });

    return {
      trainerId: integration.userId.value,
      customer,
      sender,
      integration,
    };
  }

  private detectSender(
    input: ResolveMessageContextInput,
    trainerAccountIds: Set<string>,
  ): MessageSender {
    if (input.isEcho || trainerAccountIds.has(input.senderId)) {
      return MessageSender.TRAINER;
    }

    return MessageSender.CUSTOMER;
  }

  private async findOrCreateCustomer(input: {
    trainerId: string;
    channel: MessageChannel;
    customerExternalId: string;
    displayName?: string;
  }): Promise<Customer> {
    const existing = await this.findCustomer(
      input.trainerId,
      input.channel,
      input.customerExternalId,
    );

    if (existing) {
      return existing;
    }

    const { firstName, lastName } = splitDisplayName(input.displayName);
    const customer = Customer.create({
      userId: input.trainerId,
      source: sourceForChannel(input.channel),
      firstName,
      lastName,
      status: CustomerStatusEnum.GUEST,
      ...identityForChannel(input.channel, input.customerExternalId),
    });

    try {
      await assertCustomerUniqueForUser(this.customerRepository, customer);
      await this.customerRepository.save(customer);
      return customer;
    } catch (error) {
      if (
        !(error instanceof CustomerAlreadyExistsException) &&
        !isUniqueConstraintViolation(error)
      ) {
        throw error;
      }

      const raced = await this.findCustomer(
        input.trainerId,
        input.channel,
        input.customerExternalId,
      );

      if (raced) {
        return raced;
      }

      throw error;
    }
  }

  private async findCustomer(
    trainerId: string,
    channel: MessageChannel,
    customerExternalId: string,
  ): Promise<Customer | null> {
    if (channel === MessageChannel.INSTAGRAM) {
      return this.customerRepository.findByUserIdAndInstagramAccountId(
        trainerId,
        customerExternalId,
      );
    }

    if (channel === MessageChannel.WHATSAPP) {
      const byWhatsApp =
        await this.customerRepository.findByUserIdAndWhatsappAccountId(
          trainerId,
          customerExternalId,
        );

      if (byWhatsApp) {
        return byWhatsApp;
      }

      const phone = toPhoneNumber(customerExternalId);
      return phone
        ? this.customerRepository.findByUserIdAndPhone(trainerId, phone)
        : null;
    }

    const phone = toPhoneNumber(customerExternalId);
    return phone
      ? this.customerRepository.findByUserIdAndPhone(trainerId, phone)
      : null;
  }
}

function collectTrainerAccountIds(integration: UserIntegration): Set<string> {
  const settings = integration.settings as Partial<
    InstagramSettings & WhatsAppSettings
  >;
  const ids = [
    integration.externalAccountId,
    settings.phoneNumberId,
    settings.wabaId,
    settings.instagramBusinessAccountId,
    settings.facebookPageId,
    settings.displayPhoneNumber?.replace(/[\s-]/g, ''),
  ];

  return new Set(ids.filter((id): id is string => Boolean(id?.trim())));
}

function sourceForChannel(channel: MessageChannel): CustomerSource {
  if (channel === MessageChannel.INSTAGRAM) {
    return CustomerSource.IG;
  }

  if (channel === MessageChannel.WHATSAPP) {
    return CustomerSource.WHATSAPP;
  }

  return CustomerSource.MANUAL;
}

function identityForChannel(
  channel: MessageChannel,
  customerExternalId: string,
): {
  instagramAccountId?: string;
  whatsappAccountId?: string;
  phoneNumber?: string;
} {
  if (channel === MessageChannel.INSTAGRAM) {
    return { instagramAccountId: customerExternalId };
  }

  if (channel === MessageChannel.WHATSAPP) {
    return {
      whatsappAccountId: customerExternalId,
      phoneNumber: toPhoneNumber(customerExternalId),
    };
  }

  return { phoneNumber: toPhoneNumber(customerExternalId) };
}

function splitDisplayName(displayName?: string): {
  firstName: string;
  lastName?: string;
} {
  const trimmed = displayName?.trim();

  if (!trimmed) {
    return { firstName: 'Guest' };
  }

  const parts = trimmed.split(/\s+/).filter(Boolean);
  const firstName = clipName(parts[0]) || 'Guest';
  const lastName =
    parts.length > 1 ? clipName(parts.slice(1).join(' ')) : undefined;

  return { firstName, lastName };
}

function clipName(value: string): string {
  return value.slice(0, MAX_NAME_LENGTH);
}

function toPhoneNumber(value: string): string | undefined {
  const normalized = value.replace(/[\s-]/g, '');

  if (!PHONE_REGEX.test(normalized)) {
    return undefined;
  }

  return normalized;
}

function isUniqueConstraintViolation(error: unknown): boolean {
  if (error instanceof UniqueConstraintViolationException) {
    return true;
  }

  return (
    typeof error === 'object' &&
    error !== null &&
    'code' in error &&
    (error as { code?: string }).code === '23505'
  );
}
