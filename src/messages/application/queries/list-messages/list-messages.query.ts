import { Query } from '@common/application/cqrs';
import type { PaginationInput, PaginatedResult } from '@common/pagination';
import type { MessageReadModel } from '@messages/application/read-models';

export type ListMessagesPayload = PaginationInput & {
  userId: string;
};

export class ListMessagesQuery extends Query<
  ListMessagesPayload,
  PaginatedResult<MessageReadModel>
> {
  constructor(payload: ListMessagesPayload) {
    super(payload);
  }
}
