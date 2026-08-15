import { Query } from '@common/application/cqrs';
import type { PaginationInput, PaginatedResult } from '@common/pagination';
import type { BroadcastReadModel } from '@broadcasts/application/read-models';

export type ListBroadcastsPayload = PaginationInput & {
  userId: string;
};

export class ListBroadcastsQuery extends Query<
  ListBroadcastsPayload,
  PaginatedResult<BroadcastReadModel>
> {
  constructor(payload: ListBroadcastsPayload) {
    super(payload);
  }
}
