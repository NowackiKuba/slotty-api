import { Query } from '@common/application/cqrs';
import type { PaginationInput, PaginatedResult } from '@common/pagination';
import type { CustomerPackageReadModel } from '@packages/application/read-models';

export type ListCustomerPackagesPayload = PaginationInput & {
  userId: string;
};

export class ListCustomerPackagesQuery extends Query<
  ListCustomerPackagesPayload,
  PaginatedResult<CustomerPackageReadModel>
> {
  constructor(payload: ListCustomerPackagesPayload) {
    super(payload);
  }
}
