import { Query } from '@common/application/cqrs';
import type { CustomerWithFullDetailsReadModel } from '@customers/application/read-models';

export type GetCustomerByIdPayload = {
  userId: string;
  customerId: string;
};

export class GetCustomerByIdQuery extends Query<
  GetCustomerByIdPayload,
  CustomerWithFullDetailsReadModel
> {
  constructor(payload: GetCustomerByIdPayload) {
    super(payload);
  }
}
