import { Inject } from '@nestjs/common';
import { QueryHandler, type IQueryHandler } from '@common/application/cqrs';
import { GetEventByIdQuery } from './get-event-by-id.query';
import { getOwnedEvent } from '@events/application/get-owned-event';
import { EventReadModelMapper } from '@events/application/mappers';
import type { EventReadModel } from '@events/application/read-models';
import type { IEventRepository } from '@events/domain/repositories';
import { EVENT_REPOSITORY } from '@events/domain/tokens';

@QueryHandler(GetEventByIdQuery)
export class GetEventByIdHandler implements IQueryHandler<
  GetEventByIdQuery,
  EventReadModel
> {
  constructor(
    private readonly mapper: EventReadModelMapper,
    @Inject(EVENT_REPOSITORY)
    private readonly eventRepository: IEventRepository,
  ) {}

  async execute(query: GetEventByIdQuery): Promise<EventReadModel> {
    const { eventId, userId } = query.payload;
    const event = await getOwnedEvent(this.eventRepository, eventId, userId);

    return this.mapper.toReadModel(event);
  }
}
