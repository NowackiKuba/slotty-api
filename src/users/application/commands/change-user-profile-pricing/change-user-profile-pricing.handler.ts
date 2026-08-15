import { Inject } from '@nestjs/common';
import { CommandHandler, type ICommandHandler } from '@common/application/cqrs';
import { UserProfileReadModelMapper } from '@users/application/mappers';
import type { UserProfileReadModel } from '@users/application/read-models';
import { UserProfileNotFoundException } from '@users/domain/exceptions/profile';
import type { IUserProfileRepository } from '@users/domain/repositories';
import { USER_PROFILE_REPOSITORY } from '@users/domain/tokens';
import { ChangeUserProfilePricingCommand } from './change-user-profile-pricing.command';

@CommandHandler(ChangeUserProfilePricingCommand)
export class ChangeUserProfilePricingHandler implements ICommandHandler<
  ChangeUserProfilePricingCommand,
  UserProfileReadModel
> {
  constructor(
    private readonly mapper: UserProfileReadModelMapper,
    @Inject(USER_PROFILE_REPOSITORY)
    private readonly userProfileRepository: IUserProfileRepository,
  ) {}

  async execute(
    command: ChangeUserProfilePricingCommand,
  ): Promise<UserProfileReadModel> {
    const {
      userId,
      pricePerSession,
      currency,
      sessionDurationMinutes,
      courtFeeIncluded,
      maxGroupSize,
    } = command.payload;
    const profile = await this.userProfileRepository.findByUserId(userId);

    if (!profile) {
      throw new UserProfileNotFoundException({ userId });
    }

    if (pricePerSession !== undefined || currency !== undefined) {
      profile.changeSessionPrice(
        pricePerSession ?? profile.sessionPrice.amountMinor,
        currency,
      );
    }

    if (sessionDurationMinutes !== undefined) {
      profile.changeSessionDuration(sessionDurationMinutes);
    }

    if (courtFeeIncluded !== undefined) {
      profile.changeCourtFeeIncluded(courtFeeIncluded);
    }

    if (maxGroupSize !== undefined) {
      profile.changeMaxGroupSize(maxGroupSize);
    }

    await this.userProfileRepository.save(profile);

    return this.mapper.toReadModel(profile);
  }
}
