import { Inject } from '@nestjs/common';
import { CommandHandler, type ICommandHandler } from '@common/application/cqrs';
import { UserProfileReadModelMapper } from '@users/application/mappers';
import type { UserProfileReadModel } from '@users/application/read-models';
import { UserProfileNotFoundException } from '@users/domain/exceptions/profile';
import type { IUserProfileRepository } from '@users/domain/repositories';
import { USER_PROFILE_REPOSITORY } from '@users/domain/tokens';
import { ChangeUserProfilePaymentsCommand } from './change-user-profile-payments.command';

@CommandHandler(ChangeUserProfilePaymentsCommand)
export class ChangeUserProfilePaymentsHandler implements ICommandHandler<
  ChangeUserProfilePaymentsCommand,
  UserProfileReadModel
> {
  constructor(
    private readonly mapper: UserProfileReadModelMapper,
    @Inject(USER_PROFILE_REPOSITORY)
    private readonly userProfileRepository: IUserProfileRepository,
  ) {}

  async execute(
    command: ChangeUserProfilePaymentsCommand,
  ): Promise<UserProfileReadModel> {
    const {
      userId,
      settlementType,
      paymentMethods,
      paymentDetails,
      cancellationWindowHours,
    } = command.payload;
    const profile = await this.userProfileRepository.findByUserId(userId);

    if (!profile) {
      throw new UserProfileNotFoundException({ userId });
    }

    if (settlementType !== undefined) {
      profile.changeSettlementType(settlementType);
    }

    if (paymentMethods !== undefined) {
      profile.changePaymentMethods(paymentMethods);
    }

    if (paymentDetails !== undefined) {
      profile.changePaymentDetails(paymentDetails);
    }

    if (cancellationWindowHours !== undefined) {
      profile.changeCancellationWindow(cancellationWindowHours);
    }

    await this.userProfileRepository.save(profile);

    return this.mapper.toReadModel(profile);
  }
}
