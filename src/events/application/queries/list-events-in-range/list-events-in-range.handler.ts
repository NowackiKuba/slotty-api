import { Inject } from '@nestjs/common';
import { QueryHandler, type IQueryHandler } from '@common/application/cqrs';
import { ListEventsInRangeQuery } from './list-events-in-range.query';
import { getOwnedCustomer } from '@customers/application/get-owned-customer';
import type { ICustomerRepository } from '@customers/domain/repositories';
import { CUSTOMER_REPOSITORY } from '@customers/domain/tokens';
import { EventReadModelMapper } from '@events/application/mappers';
import type { EventReadModel } from '@events/application/read-models';
import type { IEventRepository } from '@events/domain/repositories';
import { EVENT_REPOSITORY } from '@events/domain/tokens';

@QueryHandler(ListEventsInRangeQuery)
export class ListEventsInRangeHandler implements IQueryHandler<
  ListEventsInRangeQuery,
  EventReadModel[]
> {
  constructor(
    private readonly mapper: EventReadModelMapper,
    @Inject(EVENT_REPOSITORY)
    private readonly eventRepository: IEventRepository,
    @Inject(CUSTOMER_REPOSITORY)
    private readonly customerRepository: ICustomerRepository,
  ) {}

  async execute(query: ListEventsInRangeQuery): Promise<EventReadModel[]> {
    const { userId, from, to, customerId } = query.payload;

    if (customerId) {
      await getOwnedCustomer(this.customerRepository, customerId, userId);
    }

    const events = customerId
      ? await this.eventRepository.findByCustomerIdInRange(customerId, from, to)
      : await this.eventRepository.findByUserIdInRange(userId, from, to);

    return events.map((event) => this.mapper.toReadModel(event));
  }
}
