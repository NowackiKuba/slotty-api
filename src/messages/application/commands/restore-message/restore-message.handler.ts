import { Inject } from '@nestjs/common';
import { CommandHandler, type ICommandHandler } from '@common/application/cqrs';
import { RestoreMessageCommand } from './restore-message.command';
import { getOwnedMessage } from '@messages/application/get-owned-message';
import { MessageReadModelMapper } from '@messages/application/mappers';
import { MessageReadModel } from '@messages/application/read-models';
import type { IMessageRepository } from '@messages/domain/repositories';
import { MESSAGE_REPOSITORY } from '@messages/domain/tokens';

@CommandHandler(RestoreMessageCommand)
export class RestoreMessageHandler implements ICommandHandler<
  RestoreMessageCommand,
  MessageReadModel
> {
  constructor(
    private readonly mapper: MessageReadModelMapper,
    @Inject(MESSAGE_REPOSITORY)
    private readonly messageRepository: IMessageRepository,
  ) {}

  async execute(command: RestoreMessageCommand): Promise<MessageReadModel> {
    const { userId, messageId } = command.payload;
    const message = await getOwnedMessage(
      this.messageRepository,
      messageId,
      userId,
      { includeDeleted: true },
    );

    message.restore();
    await this.messageRepository.save(message);

    return this.mapper.toReadModel(message);
  }
}
