import { Inject } from '@nestjs/common';
import { CommandHandler, type ICommandHandler } from '@common/application/cqrs';
import { UserProfileReadModelMapper } from '@users/application/mappers';
import type { UserProfileReadModel } from '@users/application/read-models';
import { UserProfileNotFoundException } from '@users/domain/exceptions/profile';
import type { IUserProfileRepository } from '@users/domain/repositories';
import { USER_PROFILE_REPOSITORY } from '@users/domain/tokens';
import { UserId } from '@users/domain/value-objects';
import { ChangeUserProfileSportsCommand } from './change-user-profile-sports.command';

@CommandHandler(ChangeUserProfileSportsCommand)
export class ChangeUserProfileSportsHandler implements ICommandHandler<
  ChangeUserProfileSportsCommand,
  UserProfileReadModel
> {
  constructor(
    private readonly mapper: UserProfileReadModelMapper,
    @Inject(USER_PROFILE_REPOSITORY)
    private readonly userProfileRepository: IUserProfileRepository,
  ) {}

  async execute(
    command: ChangeUserProfileSportsCommand,
  ): Promise<UserProfileReadModel> {
    const { userId, sports } = command.payload;
    const profile = await this.userProfileRepository.findByUserId(
      UserId.create(userId),
    );

    if (!profile) {
      throw new UserProfileNotFoundException({ userId });
    }

    profile.changeSports(sports);
    await this.userProfileRepository.save(profile);

    return this.mapper.toReadModel(profile);
  }
}
