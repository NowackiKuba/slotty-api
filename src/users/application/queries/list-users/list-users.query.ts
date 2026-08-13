import { Query } from '@common/application/cqrs';
import type { PaginationInput } from '@common/pagination';
import type { PaginatedResult } from '@common/pagination';
import type { UserReadModel } from '@users/application/read-models';

export type ListUsersPayload = PaginationInput;

export class ListUsersQuery extends Query<
  ListUsersPayload,
  PaginatedResult<UserReadModel>
> {
  constructor(payload: ListUsersPayload) {
    super(payload);
  }
}
