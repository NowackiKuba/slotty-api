import { Inject } from '@nestjs/common';
import { CommandHandler, type ICommandHandler } from '@common/application/cqrs';
import { UserProfileReadModelMapper } from '@users/application/mappers';
import type { UserProfileReadModel } from '@users/application/read-models';
import { UserProfileNotFoundException } from '@users/domain/exceptions/profile';
import type { IUserProfileRepository } from '@users/domain/repositories';
import { USER_PROFILE_REPOSITORY } from '@users/domain/tokens';
import { UserId } from '@users/domain/value-objects';
import { ChangeUserProfileAiCommand } from './change-user-profile-ai.command';

@CommandHandler(ChangeUserProfileAiCommand)
export class ChangeUserProfileAiHandler implements ICommandHandler<
  ChangeUserProfileAiCommand,
  UserProfileReadModel
> {
  constructor(
    private readonly mapper: UserProfileReadModelMapper,
    @Inject(USER_PROFILE_REPOSITORY)
    private readonly userProfileRepository: IUserProfileRepository,
  ) {}

  async execute(
    command: ChangeUserProfileAiCommand,
  ): Promise<UserProfileReadModel> {
    const {
      userId,
      aiEnabled,
      autoConfirmBookings,
      aiCustomInstructions,
      googleCalendarId,
    } = command.payload;
    const profile = await this.userProfileRepository.findByUserId(
      UserId.create(userId),
    );

    if (!profile) {
      throw new UserProfileNotFoundException({ userId });
    }

    if (aiEnabled !== undefined) {
      profile.changeAiEnabled(aiEnabled);
    }

    if (autoConfirmBookings !== undefined) {
      profile.changeAutoConfirmBookings(autoConfirmBookings);
    }

    if (aiCustomInstructions !== undefined) {
      profile.changeAiInstructions(aiCustomInstructions);
    }

    if (googleCalendarId !== undefined) {
      profile.changeGoogleCalendarId(googleCalendarId);
    }

    await this.userProfileRepository.save(profile);

    return this.mapper.toReadModel(profile);
  }
}
