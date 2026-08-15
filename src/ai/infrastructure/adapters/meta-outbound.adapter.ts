import { Inject, Injectable } from '@nestjs/common';
import { QueryBus } from '@common/application/cqrs';
import {
  OUTBOUND_SENDER_PORT,
  type OutboundSenderPort,
  type OutboundSendInput,
  type OutboundSendResult,
} from '@ai/domain/ports/outbound-sender.port';
import { GetCustomerByIdQuery } from '@customers/application/queries/get-customer-by-id/get-customer-by-id.query';
import type { CustomerWithFullDetailsReadModel } from '@customers/application/read-models';
import { MessageChannel } from '@messages/domain/enums';
import { USER_INTEGRATION_REPOSITORY } from '@users/domain/tokens';
import type { IUserIntegrationRepository } from '@users/domain/repositories';
import { UserId } from '@users/domain/value-objects';
import { IntegrationProviderEnum } from '@users/domain/enums';
import type { UserIntegration } from '@users/domain/aggregates';
import type { InstagramSettings, WhatsAppSettings } from '@users/domain/types';
import { UserIntegrationNotFoundException } from '@users/domain/exceptions/integration';

const META_GRAPH_URL = 'https://graph.facebook.com/v21.0';

@Injectable()
export class MetaOutboundAdapter implements OutboundSenderPort {
  constructor(
    private readonly queryBus: QueryBus,
    @Inject(USER_INTEGRATION_REPOSITORY)
    private readonly userIntegrationRepository: IUserIntegrationRepository,
  ) {}

  async send(input: OutboundSendInput): Promise<OutboundSendResult> {
    const customer = await this.queryBus.execute<
      GetCustomerByIdQuery,
      CustomerWithFullDetailsReadModel
    >(
      new GetCustomerByIdQuery({
        userId: input.trainerId,
        customerId: input.customerId,
      }),
    );

    if (input.channel === MessageChannel.INSTAGRAM) {
      return this.sendInstagram(input, customer);
    }

    if (input.channel === MessageChannel.WHATSAPP) {
      return this.sendWhatsApp(input, customer);
    }

    throw new Error(`Outbound channel ${input.channel} is not supported`);
  }

  private async sendInstagram(
    input: OutboundSendInput,
    customer: CustomerWithFullDetailsReadModel,
  ): Promise<OutboundSendResult> {
    const recipientId = customer.instagramAccountId;

    if (!recipientId) {
      throw new Error('Customer has no Instagram account id');
    }

    const integration = await this.requireUsableIntegration(
      input.trainerId,
      IntegrationProviderEnum.INSTAGRAM_DM,
    );
    const settings = integration.settings;

    if (!isInstagramSettings(settings)) {
      throw new Error('Instagram integration settings are incomplete');
    }

    const payload = await this.graphPost<{ message_id?: string }>(
      `/${settings.instagramBusinessAccountId}/messages`,
      {
        recipient: { id: recipientId },
        message: { text: input.text },
      },
      integration.accessToken,
    );

    return {
      externalMessageId:
        payload.message_id ?? fallbackExternalId(input.channel, customer.id),
    };
  }

  private async sendWhatsApp(
    input: OutboundSendInput,
    customer: CustomerWithFullDetailsReadModel,
  ): Promise<OutboundSendResult> {
    const recipientId = customer.whatsappAccountId ?? customer.phoneNumber;

    if (!recipientId) {
      throw new Error('Customer has no WhatsApp account id');
    }

    const integration = await this.requireUsableIntegration(
      input.trainerId,
      IntegrationProviderEnum.WHATSAPP_CLOUD,
    );
    const settings = integration.settings;

    if (!isWhatsAppSettings(settings)) {
      throw new Error('WhatsApp integration settings are incomplete');
    }

    const payload = await this.graphPost<{
      messages?: Array<{ id?: string }>;
    }>(
      `/${settings.phoneNumberId}/messages`,
      {
        messaging_product: 'whatsapp',
        recipient_type: 'individual',
        to: recipientId,
        type: 'text',
        text: { preview_url: false, body: input.text },
      },
      integration.accessToken,
    );

    return {
      externalMessageId:
        payload.messages?.[0]?.id ??
        fallbackExternalId(input.channel, customer.id),
    };
  }

  private async requireUsableIntegration(
    trainerId: string,
    provider: IntegrationProviderEnum,
  ): Promise<UserIntegration> {
    const integration =
      await this.userIntegrationRepository.findByUserIdAndProvider(
        UserId.create(trainerId),
        provider,
      );

    if (!integration) {
      throw new UserIntegrationNotFoundException({
        userId: trainerId,
        provider,
      });
    }

    if (!integration.status.isUsable) {
      throw new Error(`${provider} integration is not connected`);
    }

    if (integration.isTokenExpired()) {
      throw new Error(`${provider} access token is expired`);
    }

    if (!integration.accessToken) {
      throw new Error(`${provider} access token is missing`);
    }

    return integration;
  }

  private async graphPost<T>(
    path: string,
    body: Record<string, unknown>,
    accessToken: string | null,
  ): Promise<T> {
    if (!accessToken) {
      throw new Error('Meta access token is missing');
    }

    const response = await fetch(`${META_GRAPH_URL}${path}`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });
    const payload = (await response.json()) as T & {
      error?: { message?: string };
    };

    if (!response.ok) {
      throw new Error(
        payload.error?.message ??
          `Meta Graph API request failed (${response.status})`,
      );
    }

    return payload;
  }
}

function isInstagramSettings(
  value: UserIntegration['settings'],
): value is InstagramSettings {
  return (
    typeof value === 'object' &&
    value !== null &&
    'instagramBusinessAccountId' in value &&
    'facebookPageId' in value
  );
}

function isWhatsAppSettings(
  value: UserIntegration['settings'],
): value is WhatsAppSettings {
  return (
    typeof value === 'object' &&
    value !== null &&
    'phoneNumberId' in value &&
    'wabaId' in value
  );
}

function fallbackExternalId(
  channel: MessageChannel,
  customerId: string,
): string {
  return `meta:${channel}:${customerId}:${Date.now()}`;
}

export const metaOutboundSenderProvider = {
  provide: OUTBOUND_SENDER_PORT,
  useClass: MetaOutboundAdapter,
};
