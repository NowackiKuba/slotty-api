import { Inject } from '@nestjs/common';
import { CommandHandler, type ICommandHandler } from '@common/application/cqrs';
import { UserProfileReadModelMapper } from '@users/application/mappers';
import type { UserProfileReadModel } from '@users/application/read-models';
import { UserProfileNotFoundException } from '@users/domain/exceptions/profile';
import type { IUserProfileRepository } from '@users/domain/repositories';
import { USER_PROFILE_REPOSITORY } from '@users/domain/tokens';
import { ChangeUserProfileLocationsCommand } from './change-user-profile-locations.command';

@CommandHandler(ChangeUserProfileLocationsCommand)
export class ChangeUserProfileLocationsHandler implements ICommandHandler<
  ChangeUserProfileLocationsCommand,
  UserProfileReadModel
> {
  constructor(
    private readonly mapper: UserProfileReadModelMapper,
    @Inject(USER_PROFILE_REPOSITORY)
    private readonly userProfileRepository: IUserProfileRepository,
  ) {}

  async execute(
    command: ChangeUserProfileLocationsCommand,
  ): Promise<UserProfileReadModel> {
    const { userId, places, withTravel } = command.payload;
    const profile = await this.userProfileRepository.findByUserId(userId);

    if (!profile) {
      throw new UserProfileNotFoundException({ userId });
    }

    if (places !== undefined) {
      profile.changePlaces(places);
    }

    if (withTravel !== undefined) {
      profile.changeWithTravel(withTravel);
    }

    await this.userProfileRepository.save(profile);

    return this.mapper.toReadModel(profile);
  }
}
