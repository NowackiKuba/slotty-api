import { Inject } from '@nestjs/common';
import { CommandHandler, type ICommandHandler } from '@common/application/cqrs';
import { UserReadModelMapper } from '@users/application/mappers';
import type { UserReadModel } from '@users/application/read-models';
import {
  UserAlreadyExistsException,
  UserNotFoundException,
} from '@users/domain/exceptions/user';
import type { IUserRepository } from '@users/domain/repositories';
import { USER_REPOSITORY } from '@users/domain/tokens';
import { UserId } from '@users/domain/value-objects';
import { ChangeUserDisplayNameCommand } from './change-user-display-name.command';

@CommandHandler(ChangeUserDisplayNameCommand)
export class ChangeUserDisplayNameHandler implements ICommandHandler<
  ChangeUserDisplayNameCommand,
  UserReadModel
> {
  constructor(
    private readonly mapper: UserReadModelMapper,
    @Inject(USER_REPOSITORY)
    private readonly userRepository: IUserRepository,
  ) {}

  async execute(command: ChangeUserDisplayNameCommand): Promise<UserReadModel> {
    const { id, displayName } = command.payload;
    const user = await this.userRepository.findById(UserId.create(id));

    if (!user) {
      throw new UserNotFoundException(id);
    }

    const existing = await this.userRepository.findByDisplayName(displayName);
    if (existing && !existing.id.equals(user.id)) {
      throw new UserAlreadyExistsException({ displayName });
    }

    user.changeDisplayName(displayName);
    await this.userRepository.save(user);

    return this.mapper.toReadModel(user);
  }
}
