import { Inject } from '@nestjs/common';
import { CommandHandler, type ICommandHandler } from '@common/application/cqrs';
import { getOwnedBroadcast } from '@broadcasts/application/get-owned-broadcast';
import { BroadcastReadModelMapper } from '@broadcasts/application/mappers';
import type { BroadcastDetailReadModel } from '@broadcasts/application/read-models';
import { InvalidBroadcastException } from '@broadcasts/domain/exceptions';
import type {
  IBroadcastRecipientRepository,
  IBroadcastRepository,
} from '@broadcasts/domain/repositories';
import {
  BROADCAST_RECIPIENT_REPOSITORY,
  BROADCAST_REPOSITORY,
} from '@broadcasts/domain/tokens';
import { StartBroadcastCommand } from './start-broadcast.command';

@CommandHandler(StartBroadcastCommand)
export class StartBroadcastHandler implements ICommandHandler<
  StartBroadcastCommand,
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
    command: StartBroadcastCommand,
  ): Promise<BroadcastDetailReadModel> {
    const { userId, broadcastId } = command.payload;
    const broadcast = await getOwnedBroadcast(
      this.broadcastRepository,
      broadcastId,
      userId,
    );
    const recipients =
      await this.recipientRepository.listByBroadcastId(broadcastId);

    if (recipients.length === 0) {
      throw new InvalidBroadcastException(
        'cannot start a broadcast without recipients',
      );
    }

    broadcast.startSending();
    await this.broadcastRepository.save(broadcast);

    return this.mapper.toDetailReadModel(broadcast, recipients);
  }
}
