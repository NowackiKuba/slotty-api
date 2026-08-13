import { Inject } from '@nestjs/common';
import { CommandHandler, type ICommandHandler } from '@common/application/cqrs';
import { UserReadModelMapper } from '@users/application/mappers';
import type { UserReadModel } from '@users/application/read-models';
import { UserNotFoundException } from '@users/domain/exceptions';
import type { IUserRepository } from '@users/domain/repositories';
import { USER_REPOSITORY } from '@users/domain/tokens';
import {
  UserId,
  UserSubscriptionStatus,
} from '@users/domain/value-objects';
import { ChangeUserSubscriptionStatusCommand } from './change-user-subscription-status.command';

@CommandHandler(ChangeUserSubscriptionStatusCommand)
export class ChangeUserSubscriptionStatusHandler
  implements ICommandHandler<ChangeUserSubscriptionStatusCommand, UserReadModel>
{
  constructor(
    private readonly mapper: UserReadModelMapper,
    @Inject(USER_REPOSITORY)
    private readonly userRepository: IUserRepository,
  ) {}

  async execute(
    command: ChangeUserSubscriptionStatusCommand,
  ): Promise<UserReadModel> {
    const { userId, subscriptionStatus } = command.payload;
    const user = await this.userRepository.findById(UserId.create(userId));

    if (!user) {
      throw new UserNotFoundException(userId);
    }

    user.changeSubscriptionStatus(
      UserSubscriptionStatus.create(subscriptionStatus),
    );
    await this.userRepository.save(user);

    return this.mapper.toReadModel(user);
  }
}
