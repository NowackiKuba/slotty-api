import { Inject } from '@nestjs/common';
import { CommandHandler, type ICommandHandler } from '@common/application/cqrs';
import { UserProfileReadModelMapper } from '@users/application/mappers';
import type { UserProfileReadModel } from '@users/application/read-models';
import { UserProfileNotFoundException } from '@users/domain/exceptions/profile';
import type { IUserProfileRepository } from '@users/domain/repositories';
import { USER_PROFILE_REPOSITORY } from '@users/domain/tokens';
import { UserId } from '@users/domain/value-objects';
import { ChangeUserProfileDetailsCommand } from './change-user-profile-details.command';

@CommandHandler(ChangeUserProfileDetailsCommand)
export class ChangeUserProfileDetailsHandler implements ICommandHandler<
  ChangeUserProfileDetailsCommand,
  UserProfileReadModel
> {
  constructor(
    private readonly mapper: UserProfileReadModelMapper,
    @Inject(USER_PROFILE_REPOSITORY)
    private readonly userProfileRepository: IUserProfileRepository,
  ) {}

  async execute(
    command: ChangeUserProfileDetailsCommand,
  ): Promise<UserProfileReadModel> {
    const { userId, nickname, bio, avatarUrl } = command.payload;
    const profile = await this.userProfileRepository.findByUserId(
      UserId.create(userId),
    );

    if (!profile) {
      throw new UserProfileNotFoundException({ userId });
    }

    if (nickname !== undefined) {
      profile.changeNickname(nickname);
    }

    if (bio !== undefined) {
      profile.changeBio(bio);
    }

    if (avatarUrl !== undefined) {
      profile.changeAvatarUrl(avatarUrl);
    }

    await this.userProfileRepository.save(profile);

    return this.mapper.toReadModel(profile);
  }
}
