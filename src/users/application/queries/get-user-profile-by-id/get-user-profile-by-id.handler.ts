import { Inject } from '@nestjs/common';
import { QueryHandler, type IQueryHandler } from '@common/application/cqrs';
import { UserProfileReadModelMapper } from '@users/application/mappers';
import type { UserProfileReadModel } from '@users/application/read-models';
import { UserProfileNotFoundException } from '@users/domain/exceptions/profile';
import type { IUserProfileRepository } from '@users/domain/repositories';
import { USER_PROFILE_REPOSITORY } from '@users/domain/tokens';
import { UserProfileId } from '@users/domain/value-objects';
import { GetUserProfileByIdQuery } from './get-user-profile-by-id.query';

@QueryHandler(GetUserProfileByIdQuery)
export class GetUserProfileByIdHandler implements IQueryHandler<
  GetUserProfileByIdQuery,
  UserProfileReadModel
> {
  constructor(
    private readonly mapper: UserProfileReadModelMapper,
    @Inject(USER_PROFILE_REPOSITORY)
    private readonly userProfileRepository: IUserProfileRepository,
  ) {}

  async execute(query: GetUserProfileByIdQuery): Promise<UserProfileReadModel> {
    const { id } = query.payload;
    const profile = await this.userProfileRepository.findById(
      UserProfileId.create(id),
    );

    if (!profile) {
      throw new UserProfileNotFoundException({ profileId: id });
    }

    return this.mapper.toReadModel(profile);
  }
}
