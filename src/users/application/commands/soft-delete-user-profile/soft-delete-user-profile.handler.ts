import { Inject } from '@nestjs/common';
import { CommandHandler, type ICommandHandler } from '@common/application/cqrs';
import { UserProfileNotFoundException } from '@users/domain/exceptions/profile';
import type { IUserProfileRepository } from '@users/domain/repositories';
import { USER_PROFILE_REPOSITORY } from '@users/domain/tokens';
import { UserId } from '@users/domain/value-objects';
import { SoftDeleteUserProfileCommand } from './soft-delete-user-profile.command';

@CommandHandler(SoftDeleteUserProfileCommand)
export class SoftDeleteUserProfileHandler implements ICommandHandler<
  SoftDeleteUserProfileCommand,
  void
> {
  constructor(
    @Inject(USER_PROFILE_REPOSITORY)
    private readonly userProfileRepository: IUserProfileRepository,
  ) {}

  async execute(command: SoftDeleteUserProfileCommand): Promise<void> {
    const { userId } = command.payload;
    const profile = await this.userProfileRepository.findByUserId(
      UserId.create(userId),
    );

    if (!profile) {
      throw new UserProfileNotFoundException({ userId });
    }

    profile.softDelete();
    await this.userProfileRepository.save(profile);
  }
}
