import { Query } from '@common/application/cqrs';
import type { PaginationInput, PaginatedResult } from '@common/pagination';
import type { CustomerWithFullDetailsReadModel } from '@customers/application/read-models';

export type ListCustomersPayload = PaginationInput & {
  userId: string;
};

export class ListCustomersQuery extends Query<
  ListCustomersPayload,
  PaginatedResult<CustomerWithFullDetailsReadModel>
> {
  constructor(payload: ListCustomersPayload) {
    super(payload);
  }
}
