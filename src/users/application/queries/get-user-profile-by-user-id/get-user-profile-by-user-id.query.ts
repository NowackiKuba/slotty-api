import { Query } from '@common/application/cqrs';
import type { UserProfileReadModel } from '@users/application/read-models';

export type GetUserProfileByUserIdPayload = {
  userId: string;
};

export class GetUserProfileByUserIdQuery extends Query<
  GetUserProfileByUserIdPayload,
  UserProfileReadModel
> {
  constructor(payload: GetUserProfileByUserIdPayload) {
    super(payload);
  }
}
