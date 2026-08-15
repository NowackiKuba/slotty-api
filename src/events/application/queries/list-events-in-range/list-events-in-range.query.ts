import { Query } from '@common/application/cqrs';
import type { EventReadModel } from '@events/application/read-models';

export type ListEventsInRangePayload = {
  userId: string;
  from: Date;
  to: Date;
  customerId?: string;
};

export class ListEventsInRangeQuery extends Query<
  ListEventsInRangePayload,
  EventReadModel[]
> {
  constructor(payload: ListEventsInRangePayload) {
    super(payload);
  }
}
