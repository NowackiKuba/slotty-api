import { Inject } from '@nestjs/common';
import { CommandHandler, type ICommandHandler } from '@common/application/cqrs';
import { SoftDeleteMessageCommand } from './soft-delete-message.command';
import { getOwnedMessage } from '@messages/application/get-owned-message';
import { MessageAlreadyDeletedException } from '@messages/domain/exceptions';
import type { IMessageRepository } from '@messages/domain/repositories';
import { MESSAGE_REPOSITORY } from '@messages/domain/tokens';

@CommandHandler(SoftDeleteMessageCommand)
export class SoftDeleteMessageHandler implements ICommandHandler<
  SoftDeleteMessageCommand,
  string
> {
  constructor(
    @Inject(MESSAGE_REPOSITORY)
    private readonly messageRepository: IMessageRepository,
  ) {}

  async execute(command: SoftDeleteMessageCommand): Promise<string> {
    const now = new Date();
    const { userId, messageId } = command.payload;
    const message = await getOwnedMessage(
      this.messageRepository,
      messageId,
      userId,
      { includeDeleted: true },
    );

    if (message.isDeleted) {
      throw new MessageAlreadyDeletedException({ messageId, userId });
    }

    message.softDelete(now);
    await this.messageRepository.save(message);

    return messageId;
  }
}
