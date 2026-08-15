import { Inject } from '@nestjs/common';
import { CommandHandler, type ICommandHandler } from '@common/application/cqrs';
import { getOwnedBroadcast } from '@broadcasts/application/get-owned-broadcast';
import { BroadcastReadModelMapper } from '@broadcasts/application/mappers';
import type { BroadcastDetailReadModel } from '@broadcasts/application/read-models';
import { syncBroadcastRecipients } from '@broadcasts/application/sync-broadcast-recipients';
import type {
  IBroadcastRecipientRepository,
  IBroadcastRepository,
} from '@broadcasts/domain/repositories';
import {
  BROADCAST_RECIPIENT_REPOSITORY,
  BROADCAST_REPOSITORY,
} from '@broadcasts/domain/tokens';
import type { ICustomerRepository } from '@customers/domain/repositories';
import { CUSTOMER_REPOSITORY } from '@customers/domain/tokens';
import { UpdateBroadcastCommand } from './update-broadcast.command';

@CommandHandler(UpdateBroadcastCommand)
export class UpdateBroadcastHandler implements ICommandHandler<
  UpdateBroadcastCommand,
  BroadcastDetailReadModel
> {
  constructor(
    private readonly mapper: BroadcastReadModelMapper,
    @Inject(BROADCAST_REPOSITORY)
    private readonly broadcastRepository: IBroadcastRepository,
    @Inject(BROADCAST_RECIPIENT_REPOSITORY)
    private readonly recipientRepository: IBroadcastRecipientRepository,
    @Inject(CUSTOMER_REPOSITORY)
    private readonly customerRepository: ICustomerRepository,
  ) {}

  async execute(
    command: UpdateBroadcastCommand,
  ): Promise<BroadcastDetailReadModel> {
    const {
      userId,
      broadcastId,
      messageText,
      targetChannel,
      scheduledAt,
      customerIds,
    } = command.payload;

    const broadcast = await getOwnedBroadcast(
      this.broadcastRepository,
      broadcastId,
      userId,
    );

    if (
      messageText !== undefined ||
      targetChannel !== undefined ||
      scheduledAt !== undefined
    ) {
      broadcast.changeDetails({ messageText, targetChannel, scheduledAt });
      await this.broadcastRepository.save(broadcast);
    }

    if (customerIds !== undefined) {
      broadcast.changeDetails({});
      await syncBroadcastRecipients(
        this.recipientRepository,
        this.customerRepository,
        broadcastId,
        userId,
        customerIds,
      );
    }

    const recipients =
      await this.recipientRepository.listByBroadcastId(broadcastId);

    return this.mapper.toDetailReadModel(broadcast, recipients);
  }
}
