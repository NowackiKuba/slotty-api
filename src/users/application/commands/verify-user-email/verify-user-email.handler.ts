import { Inject } from '@nestjs/common';
import { CommandHandler, type ICommandHandler } from '@common/application/cqrs';
import { UserReadModelMapper } from '@users/application/mappers';
import type { UserReadModel } from '@users/application/read-models';
import { UserNotFoundException } from '@users/domain/exceptions/user';
import type { IUserRepository } from '@users/domain/repositories';
import { USER_REPOSITORY } from '@users/domain/tokens';
import { UserId } from '@users/domain/value-objects';
import { VerifyUserEmailCommand } from './verify-user-email.command';

@CommandHandler(VerifyUserEmailCommand)
export class VerifyUserEmailHandler implements ICommandHandler<
  VerifyUserEmailCommand,
  UserReadModel
> {
  constructor(
    private readonly mapper: UserReadModelMapper,
    @Inject(USER_REPOSITORY)
    private readonly userRepository: IUserRepository,
  ) {}

  async execute(command: VerifyUserEmailCommand): Promise<UserReadModel> {
    const { id } = command.payload;
    const user = await this.userRepository.findById(UserId.create(id));

    if (!user) {
      throw new UserNotFoundException(id);
    }

    user.verifyEmail();
    await this.userRepository.save(user);

    return this.mapper.toReadModel(user);
  }
}
