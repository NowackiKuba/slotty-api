import { Inject } from '@nestjs/common';
import { CommandHandler, type ICommandHandler } from '@common/application/cqrs';
import { UserProfileReadModelMapper } from '@users/application/mappers';
import type { UserProfileReadModel } from '@users/application/read-models';
import { UserProfile } from '@users/domain/aggregates';
import { UserProfileAlreadyExistsException } from '@users/domain/exceptions/profile';
import { UserNotFoundException } from '@users/domain/exceptions/user';
import type {
  IUserProfileRepository,
  IUserRepository,
} from '@users/domain/repositories';
import { USER_PROFILE_REPOSITORY, USER_REPOSITORY } from '@users/domain/tokens';
import { UserId } from '@users/domain/value-objects';
import { CreateUserProfileCommand } from './create-user-profile.command';

@CommandHandler(CreateUserProfileCommand)
export class CreateUserProfileHandler implements ICommandHandler<
  CreateUserProfileCommand,
  UserProfileReadModel
> {
  constructor(
    private readonly mapper: UserProfileReadModelMapper,
    @Inject(USER_REPOSITORY)
    private readonly userRepository: IUserRepository,
    @Inject(USER_PROFILE_REPOSITORY)
    private readonly userProfileRepository: IUserProfileRepository,
  ) {}

  async execute(
    command: CreateUserProfileCommand,
  ): Promise<UserProfileReadModel> {
    const { userId } = command.payload;
    const user = await this.userRepository.findById(UserId.create(userId));

    if (!user) {
      throw new UserNotFoundException(userId);
    }

    const existing = await this.userProfileRepository.findByUserId(userId);

    if (existing) {
      throw new UserProfileAlreadyExistsException(userId);
    }

    const profile = UserProfile.create(command.payload);
    await this.userProfileRepository.save(profile);

    return this.mapper.toReadModel(profile);
  }
}
