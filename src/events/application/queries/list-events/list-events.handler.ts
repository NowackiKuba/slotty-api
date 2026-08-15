import { Inject } from '@nestjs/common';
import { QueryHandler, type IQueryHandler } from '@common/application/cqrs';
import { PaginatedResult } from '@common/pagination';
import { ListEventsQuery } from './list-events.query';
import { EventReadModelMapper } from '@events/application/mappers';
import type { EventReadModel } from '@events/application/read-models';
import type { IEventRepository } from '@events/domain/repositories';
import { EVENT_REPOSITORY } from '@events/domain/tokens';

@QueryHandler(ListEventsQuery)
export class ListEventsHandler implements IQueryHandler<
  ListEventsQuery,
  PaginatedResult<EventReadModel>
> {
  constructor(
    private readonly mapper: EventReadModelMapper,
    @Inject(EVENT_REPOSITORY)
    private readonly eventRepository: IEventRepository,
  ) {}

  async execute(
    query: ListEventsQuery,
  ): Promise<PaginatedResult<EventReadModel>> {
    const { userId, ...pagination } = query.payload;
    const result = await this.eventRepository.findByUserId(userId, pagination);

    return PaginatedResult.create(
      result.data.map((event) => this.mapper.toReadModel(event)),
      result.meta.total,
      pagination,
    );
  }
}
