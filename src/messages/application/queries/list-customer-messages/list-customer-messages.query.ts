import { Query } from '@common/application/cqrs';
import type { PaginationInput, PaginatedResult } from '@common/pagination';
import type { MessageReadModel } from '@messages/application/read-models';

export type ListCustomerMessagesPayload = PaginationInput & {
  userId: string;
  customerId: string;
};

export class ListCustomerMessagesQuery extends Query<
  ListCustomerMessagesPayload,
  PaginatedResult<MessageReadModel>
> {
  constructor(payload: ListCustomerMessagesPayload) {
    super(payload);
  }
}
