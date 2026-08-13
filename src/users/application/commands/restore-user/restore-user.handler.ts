import { Inject } from '@nestjs/common';
import { CommandHandler, type ICommandHandler } from '@common/application/cqrs';
import { UserReadModelMapper } from '@users/application/mappers';
import type { UserReadModel } from '@users/application/read-models';
import { UserNotFoundException } from '@users/domain/exceptions/user';
import type { IUserRepository } from '@users/domain/repositories';
import { USER_REPOSITORY } from '@users/domain/tokens';
import { UserId } from '@users/domain/value-objects';
import { RestoreUserCommand } from './restore-user.command';

@CommandHandler(RestoreUserCommand)
export class RestoreUserHandler implements ICommandHandler<
  RestoreUserCommand,
  UserReadModel
> {
  constructor(
    private readonly mapper: UserReadModelMapper,
    @Inject(USER_REPOSITORY)
    private readonly userRepository: IUserRepository,
  ) {}

  async execute(command: RestoreUserCommand): Promise<UserReadModel> {
    const { id } = command.payload;
    const user = await this.userRepository.findByIdIncludingDeleted(
      UserId.create(id),
    );

    if (!user) {
      throw new UserNotFoundException(id);
    }

    user.restore();
    await this.userRepository.save(user);

    return this.mapper.toReadModel(user);
  }
}
