import { Inject } from '@nestjs/common';
import { CommandHandler, type ICommandHandler } from '@common/application/cqrs';
import { UserReadModelMapper } from '@users/application/mappers';
import type { UserReadModel } from '@users/application/read-models';
import { User } from '@users/domain/aggregates';
import { UserAlreadyExistsException } from '@users/domain/exceptions/user';
import type { IUserRepository } from '@users/domain/repositories';
import { USER_REPOSITORY } from '@users/domain/tokens';
import { CreateUserCommand } from './create-user.command';

@CommandHandler(CreateUserCommand)
export class CreateUserHandler implements ICommandHandler<
  CreateUserCommand,
  UserReadModel
> {
  constructor(
    private readonly mapper: UserReadModelMapper,
    @Inject(USER_REPOSITORY)
    private readonly userRepository: IUserRepository,
  ) {}

  async execute(command: CreateUserCommand): Promise<UserReadModel> {
    const { id, firstName, lastName, displayName, email, avatarUrl } =
      command.payload;

    const existingByEmail = await this.userRepository.findByEmail(email);
    if (existingByEmail) {
      throw new UserAlreadyExistsException({ email });
    }

    const existingByDisplayName =
      await this.userRepository.findByDisplayName(displayName);
    if (existingByDisplayName) {
      throw new UserAlreadyExistsException({ displayName });
    }

    const user = User.create({
      id,
      firstName,
      lastName,
      displayName,
      email,
      avatarUrl,
    });

    await this.userRepository.save(user);

    return this.mapper.toReadModel(user);
  }
}
