import { Inject } from '@nestjs/common';
import { CommandHandler, type ICommandHandler } from '@common/application/cqrs';
import { getOwnedBroadcast } from '@broadcasts/application/get-owned-broadcast';
import {
  BroadcastAlreadyDeletedException,
  InvalidBroadcastException,
} from '@broadcasts/domain/exceptions';
import type {
  IBroadcastRecipientRepository,
  IBroadcastRepository,
} from '@broadcasts/domain/repositories';
import {
  BROADCAST_RECIPIENT_REPOSITORY,
  BROADCAST_REPOSITORY,
} from '@broadcasts/domain/tokens';
import { SoftDeleteBroadcastCommand } from './soft-delete-broadcast.command';

@CommandHandler(SoftDeleteBroadcastCommand)
export class SoftDeleteBroadcastHandler implements ICommandHandler<
  SoftDeleteBroadcastCommand,
  string
> {
  constructor(
    @Inject(BROADCAST_REPOSITORY)
    private readonly broadcastRepository: IBroadcastRepository,
    @Inject(BROADCAST_RECIPIENT_REPOSITORY)
    private readonly recipientRepository: IBroadcastRecipientRepository,
  ) {}

  async execute(command: SoftDeleteBroadcastCommand): Promise<string> {
    const now = new Date();
    const { userId, broadcastId } = command.payload;
    const broadcast = await getOwnedBroadcast(
      this.broadcastRepository,
      broadcastId,
      userId,
      { includeDeleted: true },
    );

    if (broadcast.isDeleted) {
      throw new BroadcastAlreadyDeletedException({ broadcastId, userId });
    }

    if (broadcast.status.isSending) {
      throw new InvalidBroadcastException(
        'cannot delete a broadcast that is sending',
        { status: broadcast.status.value },
      );
    }

    broadcast.softDelete(now);
    await this.broadcastRepository.save(broadcast);

    const recipients =
      await this.recipientRepository.listByBroadcastId(broadcastId);

    for (const recipient of recipients) {
      recipient.softDelete(now);
      await this.recipientRepository.save(recipient);
    }

    return broadcastId;
  }
}
