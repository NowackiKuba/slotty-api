import { Query } from '@common/application/cqrs';
import type { CustomerPackageReadModel } from '@packages/application/read-models';

export type ListCustomerPackagesByCustomerPayload = {
  userId: string;
  customerId: string;
};

export class ListCustomerPackagesByCustomerQuery extends Query<
  ListCustomerPackagesByCustomerPayload,
  CustomerPackageReadModel[]
> {
  constructor(payload: ListCustomerPackagesByCustomerPayload) {
    super(payload);
  }
}
