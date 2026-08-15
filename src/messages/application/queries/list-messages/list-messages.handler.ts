import { Inject } from '@nestjs/common';
import { QueryHandler, type IQueryHandler } from '@common/application/cqrs';
import { PaginatedResult } from '@common/pagination';
import { ListMessagesQuery } from './list-messages.query';
import { MessageReadModelMapper } from '@messages/application/mappers';
import type { MessageReadModel } from '@messages/application/read-models';
import type { IMessageRepository } from '@messages/domain/repositories';
import { MESSAGE_REPOSITORY } from '@messages/domain/tokens';

@QueryHandler(ListMessagesQuery)
export class ListMessagesHandler implements IQueryHandler<
  ListMessagesQuery,
  PaginatedResult<MessageReadModel>
> {
  constructor(
    private readonly mapper: MessageReadModelMapper,
    @Inject(MESSAGE_REPOSITORY)
    private readonly messageRepository: IMessageRepository,
  ) {}

  async execute(
    query: ListMessagesQuery,
  ): Promise<PaginatedResult<MessageReadModel>> {
    const { userId, ...pagination } = query.payload;
    const result = await this.messageRepository.findByUserId(
      userId,
      pagination,
    );

    return PaginatedResult.create(
      result.data.map((message) => this.mapper.toReadModel(message)),
      result.meta.total,
      pagination,
    );
  }
}
