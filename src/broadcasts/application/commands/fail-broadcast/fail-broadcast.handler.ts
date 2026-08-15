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
import { FailBroadcastCommand } from './fail-broadcast.command';

@CommandHandler(FailBroadcastCommand)
export class FailBroadcastHandler implements ICommandHandler<
  FailBroadcastCommand,
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
    command: FailBroadcastCommand,
  ): Promise<BroadcastDetailReadModel> {
    const { userId, broadcastId } = command.payload;
    const broadcast = await getOwnedBroadcast(
      this.broadcastRepository,
      broadcastId,
      userId,
    );

    broadcast.fail();
    await this.broadcastRepository.save(broadcast);

    const recipients =
      await this.recipientRepository.listByBroadcastId(broadcastId);

    return this.mapper.toDetailReadModel(broadcast, recipients);
  }
}
