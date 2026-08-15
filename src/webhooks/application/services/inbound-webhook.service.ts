import { Inject, Injectable, Logger } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { UniqueConstraintViolationException } from '@mikro-orm/core';
import { Queue } from 'bullmq';
import {
  AI_MESSAGE_QUEUE,
  PROCESS_INBOUND_MESSAGE_JOB,
  type ProcessMessageJobDto,
} from '@ai/application/dto/process-message-job.dto';
import { Message } from '@messages/domain/aggregates';
import { MessageChannel, MessageSender } from '@messages/domain/enums';
import type { IMessageRepository } from '@messages/domain/repositories';
import { MESSAGE_REPOSITORY } from '@messages/domain/tokens';
import { IntegrationProviderEnum } from '@users/domain/enums';
import {
  extractMetaInboundEvents,
  type InboundMessageEvent,
  type MetaWebhookPayloadDto,
} from '../dto/meta-webhook-payload.dto';
import type { SmsWebhookPayloadDto } from '../dto/sms-webhook-payload.dto';
import { MessageContextResolver } from '../../infrastructure/services/message-context-resolver.service';

@Injectable()
export class InboundWebhookService {
  private readonly logger = new Logger(InboundWebhookService.name);

  constructor(
    private readonly contextResolver: MessageContextResolver,
    @Inject(MESSAGE_REPOSITORY)
    private readonly messageRepository: IMessageRepository,
    @InjectQueue(AI_MESSAGE_QUEUE)
    private readonly aiMessageQueue: Queue<ProcessMessageJobDto>,
  ) {}

  async handleMetaPayload(payload: MetaWebhookPayloadDto): Promise<void> {
    const events = extractMetaInboundEvents(payload);

    for (const event of events) {
      await this.processInboundEvent(event);
    }
  }

  async handleSmsPayload(payload: SmsWebhookPayloadDto): Promise<void> {
    await this.processInboundEvent({
      channel: MessageChannel.SMS,
      provider: IntegrationProviderEnum.SMS_PROVIDER,
      senderId: payload.from.replace(/[\s-]/g, ''),
      recipientId: payload.to.replace(/[\s-]/g, ''),
      businessAccountIds: [
        payload.to.replace(/[\s-]/g, ''),
        payload.from.replace(/[\s-]/g, ''),
      ],
      externalMessageId: payload.externalMessageId,
      messageContent: payload.text,
      isEcho: false,
    });
  }

  private async processInboundEvent(event: InboundMessageEvent): Promise<void> {
    const context = await this.contextResolver.resolve({
      channel: event.channel,
      provider: event.provider,
      senderId: event.senderId,
      recipientId: event.recipientId,
      businessAccountIds: event.businessAccountIds,
      isEcho: event.isEcho,
      customerDisplayName: event.customerDisplayName,
    });

    if (!context) {
      return;
    }

    const existing = await this.messageRepository.findByExternalMessageId(
      context.trainerId,
      event.channel,
      event.externalMessageId,
    );

    if (existing) {
      this.logger.debug(
        `Ignoring duplicate ${event.channel} message ${event.externalMessageId}`,
      );
      return;
    }

    const message = Message.create({
      userId: context.trainerId,
      customerId: context.customer.id.value,
      messageContent: event.messageContent,
      sender: context.sender,
      channel: event.channel,
      externalMessageId: event.externalMessageId,
    });

    try {
      await this.messageRepository.save(message);
    } catch (error) {
      if (isUniqueConstraintViolation(error)) {
        this.logger.debug(
          `Ignoring raced duplicate ${event.channel} message ${event.externalMessageId}`,
        );
        return;
      }

      throw error;
    }

    if (context.sender !== MessageSender.CUSTOMER) {
      this.logger.debug(
        `Stored native trainer ${event.channel} message ${event.externalMessageId} without AI enqueue`,
      );
      return;
    }

    await this.aiMessageQueue.add(
      PROCESS_INBOUND_MESSAGE_JOB,
      {
        trainerId: context.trainerId,
        customerId: context.customer.id.value,
        messageId: message.id.value,
        channel: event.channel,
        messageContent: event.messageContent,
        externalMessageId: event.externalMessageId,
      },
      {
        jobId: `inbound:${event.channel}:${event.externalMessageId}`,
        removeOnComplete: 1000,
        removeOnFail: 500,
        attempts: 3,
        backoff: { type: 'exponential', delay: 2000 },
      },
    );
  }
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
