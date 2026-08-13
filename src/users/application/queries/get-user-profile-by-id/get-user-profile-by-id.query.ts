import { Query } from '@common/application/cqrs';
import type { UserProfileReadModel } from '@users/application/read-models';

export type GetUserProfileByIdPayload = {
  id: string;
};

export class GetUserProfileByIdQuery extends Query<
  GetUserProfileByIdPayload,
  UserProfileReadModel
> {
  constructor(payload: GetUserProfileByIdPayload) {
    super(payload);
  }
}
