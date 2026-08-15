import { Inject } from '@nestjs/common';
import { CommandHandler, type ICommandHandler } from '@common/application/cqrs';
import { RecordMessageToolExecutionCommand } from './record-message-tool-execution.command';
import { getOwnedMessage } from '@messages/application/get-owned-message';
import { MessageReadModelMapper } from '@messages/application/mappers';
import { MessageReadModel } from '@messages/application/read-models';
import type { IMessageRepository } from '@messages/domain/repositories';
import { MESSAGE_REPOSITORY } from '@messages/domain/tokens';

@CommandHandler(RecordMessageToolExecutionCommand)
export class RecordMessageToolExecutionHandler implements ICommandHandler<
  RecordMessageToolExecutionCommand,
  MessageReadModel
> {
  constructor(
    private readonly mapper: MessageReadModelMapper,
    @Inject(MESSAGE_REPOSITORY)
    private readonly messageRepository: IMessageRepository,
  ) {}

  async execute(
    command: RecordMessageToolExecutionCommand,
  ): Promise<MessageReadModel> {
    const { userId, messageId, tool } = command.payload;
    const message = await getOwnedMessage(
      this.messageRepository,
      messageId,
      userId,
    );

    message.recordToolExecution(tool);
    await this.messageRepository.save(message);

    return this.mapper.toReadModel(message);
  }
}
