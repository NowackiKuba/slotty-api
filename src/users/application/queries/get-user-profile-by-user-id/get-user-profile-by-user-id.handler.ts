import { Inject } from '@nestjs/common';
import { QueryHandler, type IQueryHandler } from '@common/application/cqrs';
import { UserProfileReadModelMapper } from '@users/application/mappers';
import type { UserProfileReadModel } from '@users/application/read-models';
import { UserProfileNotFoundException } from '@users/domain/exceptions/profile';
import type { IUserProfileRepository } from '@users/domain/repositories';
import { USER_PROFILE_REPOSITORY } from '@users/domain/tokens';
import { GetUserProfileByUserIdQuery } from './get-user-profile-by-user-id.query';

@QueryHandler(GetUserProfileByUserIdQuery)
export class GetUserProfileByUserIdHandler implements IQueryHandler<
  GetUserProfileByUserIdQuery,
  UserProfileReadModel
> {
  constructor(
    private readonly mapper: UserProfileReadModelMapper,
    @Inject(USER_PROFILE_REPOSITORY)
    private readonly userProfileRepository: IUserProfileRepository,
  ) {}

  async execute(
    query: GetUserProfileByUserIdQuery,
  ): Promise<UserProfileReadModel> {
    const { userId } = query.payload;
    const profile = await this.userProfileRepository.findByUserId(userId);

    if (!profile) {
      throw new UserProfileNotFoundException({ userId });
    }

    return this.mapper.toReadModel(profile);
  }
}
