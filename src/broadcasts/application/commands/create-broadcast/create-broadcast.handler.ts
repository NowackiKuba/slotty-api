import { Inject } from '@nestjs/common';
import { CommandHandler, type ICommandHandler } from '@common/application/cqrs';
import { BroadcastReadModelMapper } from '@broadcasts/application/mappers';
import type { BroadcastDetailReadModel } from '@broadcasts/application/read-models';
import { syncBroadcastRecipients } from '@broadcasts/application/sync-broadcast-recipients';
import { Broadcast } from '@broadcasts/domain/aggregates';
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
import { CreateBroadcastCommand } from './create-broadcast.command';

@CommandHandler(CreateBroadcastCommand)
export class CreateBroadcastHandler implements ICommandHandler<
  CreateBroadcastCommand,
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
    command: CreateBroadcastCommand,
  ): Promise<BroadcastDetailReadModel> {
    const { userId, messageText, targetChannel, scheduledAt, customerIds } =
      command.payload;

    const broadcast = Broadcast.create({
      userId,
      messageText,
      targetChannel,
      scheduledAt,
    });
    await this.broadcastRepository.save(broadcast);

    const recipients = await syncBroadcastRecipients(
      this.recipientRepository,
      this.customerRepository,
      broadcast.id.value,
      userId,
      customerIds,
    );

    return this.mapper.toDetailReadModel(broadcast, recipients);
  }
}
