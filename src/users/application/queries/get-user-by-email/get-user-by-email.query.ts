import { Query } from '@common/application/cqrs';
import type { UserReadModel } from '@users/application/read-models';

export type GetUserByEmailPayload = {
  email: string;
};

export class GetUserByEmailQuery extends Query<
  GetUserByEmailPayload,
  UserReadModel
> {
  constructor(payload: GetUserByEmailPayload) {
    super(payload);
  }
}
