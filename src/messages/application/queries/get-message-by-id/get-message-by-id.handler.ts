import { Inject } from '@nestjs/common';
import { QueryHandler, type IQueryHandler } from '@common/application/cqrs';
import { GetMessageByIdQuery } from './get-message-by-id.query';
import { getOwnedMessage } from '@messages/application/get-owned-message';
import { MessageReadModelMapper } from '@messages/application/mappers';
import type { MessageReadModel } from '@messages/application/read-models';
import type { IMessageRepository } from '@messages/domain/repositories';
import { MESSAGE_REPOSITORY } from '@messages/domain/tokens';

@QueryHandler(GetMessageByIdQuery)
export class GetMessageByIdHandler implements IQueryHandler<
  GetMessageByIdQuery,
  MessageReadModel
> {
  constructor(
    private readonly mapper: MessageReadModelMapper,
    @Inject(MESSAGE_REPOSITORY)
    private readonly messageRepository: IMessageRepository,
  ) {}

  async execute(query: GetMessageByIdQuery): Promise<MessageReadModel> {
    const { messageId, userId } = query.payload;
    const message = await getOwnedMessage(
      this.messageRepository,
      messageId,
      userId,
    );

    return this.mapper.toReadModel(message);
  }
}
