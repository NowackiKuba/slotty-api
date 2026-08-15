import { Inject } from '@nestjs/common';
import { CommandHandler, type ICommandHandler } from '@common/application/cqrs';
import { getOwnedBroadcast } from '@broadcasts/application/get-owned-broadcast';
import { BroadcastReadModelMapper } from '@broadcasts/application/mappers';
import type { BroadcastDetailReadModel } from '@broadcasts/application/read-models';
import { BroadcastRecipientStatusEnum } from '@broadcasts/domain/enums';
import {
  BroadcastRecipientNotFoundException,
  InvalidBroadcastRecipientException,
} from '@broadcasts/domain/exceptions';
import type {
  IBroadcastRecipientRepository,
  IBroadcastRepository,
} from '@broadcasts/domain/repositories';
import {
  BROADCAST_RECIPIENT_REPOSITORY,
  BROADCAST_REPOSITORY,
} from '@broadcasts/domain/tokens';
import { UpdateBroadcastRecipientCommand } from './update-broadcast-recipient.command';

@CommandHandler(UpdateBroadcastRecipientCommand)
export class UpdateBroadcastRecipientHandler implements ICommandHandler<
  UpdateBroadcastRecipientCommand,
  BroadcastDetailReadModel
> {
  constructor(
    private readonly mapper: BroadcastReadModelMapper,
    @Inject(BROADCAST_REPOSITORY)
    private readonly broadcastRepository: IBroadcastRepository,
    @Inject(BROADCAST_RECIPIENT_REPOSITORY)
    private readonly recipientRepository: IBroadcastRecipientRepository,
  ) {}

  async execute(
    command: UpdateBroadcastRecipientCommand,
  ): Promise<BroadcastDetailReadModel> {
    const { userId, broadcastId, customerId, status, messageId, errorMessage } =
      command.payload;

    const broadcast = await getOwnedBroadcast(
      this.broadcastRepository,
      broadcastId,
      userId,
    );
    const recipient =
      await this.recipientRepository.findByBroadcastIdAndCustomerId(
        broadcastId,
        customerId,
      );

    if (!recipient) {
      throw new BroadcastRecipientNotFoundException({
        broadcastId,
        customerId,
      });
    }

    switch (status) {
      case BroadcastRecipientStatusEnum.PROCESSING:
        recipient.markProcessing();
        break;
      case BroadcastRecipientStatusEnum.SENT:
        if (!messageId) {
          throw new InvalidBroadcastRecipientException(
            'messageId is required when marking a recipient as sent',
            { field: 'messageId' },
          );
        }
        recipient.markSent(messageId);
        broadcast.incrementSentCount();
        await this.broadcastRepository.save(broadcast);
        break;
      case BroadcastRecipientStatusEnum.DELIVERED:
        recipient.markDelivered();
        break;
      case BroadcastRecipientStatusEnum.FAILED:
        if (!errorMessage) {
          throw new InvalidBroadcastRecipientException(
            'errorMessage is required when marking a recipient as failed',
            { field: 'errorMessage' },
          );
        }
        recipient.markFailed(errorMessage);
        break;
      default:
        throw new InvalidBroadcastRecipientException(
          'recipient status cannot be set directly to this value',
          { status },
        );
    }

    await this.recipientRepository.save(recipient);

    const recipients =
      await this.recipientRepository.listByBroadcastId(broadcastId);

    if (
      broadcast.status.isSending &&
      recipients.length > 0 &&
      recipients.every((row) => row.status.isTerminal)
    ) {
      if (
        recipients.some((row) => row.status.isSent || row.status.isDelivered)
      ) {
        broadcast.complete();
      } else {
        broadcast.fail();
      }

      await this.broadcastRepository.save(broadcast);
    }

    return this.mapper.toDetailReadModel(broadcast, recipients);
  }
}
