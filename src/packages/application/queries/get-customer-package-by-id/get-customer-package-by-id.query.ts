import { Query } from '@common/application/cqrs';
import type { CustomerPackageReadModel } from '@packages/application/read-models';

export type GetCustomerPackageByIdPayload = {
  userId: string;
  customerPackageId: string;
};

export class GetCustomerPackageByIdQuery extends Query<
  GetCustomerPackageByIdPayload,
  CustomerPackageReadModel
> {
  constructor(payload: GetCustomerPackageByIdPayload) {
    super(payload);
  }
}
