import { Query } from '@common/application/cqrs';
import type { UserReadModel } from '@users/application/read-models';

export type GetUserByDisplayNamePayload = {
  displayName: string;
};

export class GetUserByDisplayNameQuery extends Query<
  GetUserByDisplayNamePayload,
  UserReadModel
> {
  constructor(payload: GetUserByDisplayNamePayload) {
    super(payload);
  }
}
