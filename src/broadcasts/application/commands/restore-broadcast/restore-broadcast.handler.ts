import { Inject } from '@nestjs/common';
import { CommandHandler, type ICommandHandler } from '@common/application/cqrs';
import { getOwnedBroadcast } from '@broadcasts/application/get-owned-broadcast';
import { BroadcastReadModelMapper } from '@broadcasts/application/mappers';
import type { BroadcastDetailReadModel } from '@broadcasts/application/read-models';
import type {
  IBroadcastRecipientRepository,
  IBroadcastRepository,
} from '@broadcasts/domain/repositories';
import {
  BROADCAST_RECIPIENT_REPOSITORY,
  BROADCAST_REPOSITORY,
} from '@broadcasts/domain/tokens';
import { RestoreBroadcastCommand } from './restore-broadcast.command';

@CommandHandler(RestoreBroadcastCommand)
export class RestoreBroadcastHandler implements ICommandHandler<
  RestoreBroadcastCommand,
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
    command: RestoreBroadcastCommand,
  ): Promise<BroadcastDetailReadModel> {
    const now = new Date();
    const { userId, broadcastId } = command.payload;
    const broadcast = await getOwnedBroadcast(
      this.broadcastRepository,
      broadcastId,
      userId,
      { includeDeleted: true },
    );

    broadcast.restore(now);
    await this.broadcastRepository.save(broadcast);

    const recipients =
      await this.recipientRepository.listByBroadcastIdIncludingDeleted(
        broadcastId,
      );

    for (const recipient of recipients) {
      if (recipient.isDeleted) {
        recipient.restore(now);
        await this.recipientRepository.save(recipient);
      }
    }

    return this.mapper.toDetailReadModel(
      broadcast,
      recipients.filter((recipient) => !recipient.isDeleted),
    );
  }
}
