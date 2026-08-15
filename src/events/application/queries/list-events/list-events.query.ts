import { Query } from '@common/application/cqrs';
import type { PaginationInput, PaginatedResult } from '@common/pagination';
import type { EventReadModel } from '@events/application/read-models';

export type ListEventsPayload = PaginationInput & {
  userId: string;
};

export class ListEventsQuery extends Query<
  ListEventsPayload,
  PaginatedResult<EventReadModel>
> {
  constructor(payload: ListEventsPayload) {
    super(payload);
  }
}
