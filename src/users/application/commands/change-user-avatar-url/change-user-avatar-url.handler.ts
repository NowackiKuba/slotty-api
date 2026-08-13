import { Inject } from '@nestjs/common';
import { CommandHandler, type ICommandHandler } from '@common/application/cqrs';
import { UserReadModelMapper } from '@users/application/mappers';
import type { UserReadModel } from '@users/application/read-models';
import { UserNotFoundException } from '@users/domain/exceptions/user';
import type { IUserRepository } from '@users/domain/repositories';
import { USER_REPOSITORY } from '@users/domain/tokens';
import { UserId } from '@users/domain/value-objects';
import { ChangeUserAvatarUrlCommand } from './change-user-avatar-url.command';

@CommandHandler(ChangeUserAvatarUrlCommand)
export class ChangeUserAvatarUrlHandler implements ICommandHandler<
  ChangeUserAvatarUrlCommand,
  UserReadModel
> {
  constructor(
    private readonly mapper: UserReadModelMapper,
    @Inject(USER_REPOSITORY)
    private readonly userRepository: IUserRepository,
  ) {}

  async execute(command: ChangeUserAvatarUrlCommand): Promise<UserReadModel> {
    const { id, avatarUrl } = command.payload;
    const user = await this.userRepository.findById(UserId.create(id));

    if (!user) {
      throw new UserNotFoundException(id);
    }

    user.changeAvatarUrl(avatarUrl);
    await this.userRepository.save(user);

    return this.mapper.toReadModel(user);
  }
}
