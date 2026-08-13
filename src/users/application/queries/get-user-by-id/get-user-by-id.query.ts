import { Query } from '@common/application/cqrs';
import type { UserReadModel } from '@users/application/read-models';

export type GetUserByIdPayload = {
  id: string;
};

export class GetUserByIdQuery extends Query<GetUserByIdPayload, UserReadModel> {
  constructor(payload: GetUserByIdPayload) {
    super(payload);
  }
}
