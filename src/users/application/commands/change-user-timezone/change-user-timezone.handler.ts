import { Inject } from '@nestjs/common';
import { CommandHandler, type ICommandHandler } from '@common/application/cqrs';
import { UserReadModelMapper } from '@users/application/mappers';
import type { UserReadModel } from '@users/application/read-models';
import { UserNotFoundException } from '@users/domain/exceptions/user';
import type { IUserRepository } from '@users/domain/repositories';
import { USER_REPOSITORY } from '@users/domain/tokens';
import { UserId, UserTimezone } from '@users/domain/value-objects';
import { ChangeUserTimezoneCommand } from './change-user-timezone.command';

@CommandHandler(ChangeUserTimezoneCommand)
export class ChangeUserTimezoneHandler implements ICommandHandler<
  ChangeUserTimezoneCommand,
  UserReadModel
> {
  constructor(
    private readonly mapper: UserReadModelMapper,
    @Inject(USER_REPOSITORY)
    private readonly userRepository: IUserRepository,
  ) {}

  async execute(command: ChangeUserTimezoneCommand): Promise<UserReadModel> {
    const { id, timezone } = command.payload;
    const user = await this.userRepository.findById(UserId.create(id));

    if (!user) {
      throw new UserNotFoundException(id);
    }

    user.changeTimezone(UserTimezone.create(timezone));
    await this.userRepository.save(user);

    return this.mapper.toReadModel(user);
  }
}
