import { Inject } from '@nestjs/common';
import { CommandHandler, type ICommandHandler } from '@common/application/cqrs';
import { UserNotFoundException } from '@users/domain/exceptions/user';
import type { IUserRepository } from '@users/domain/repositories';
import { USER_REPOSITORY } from '@users/domain/tokens';
import { UserId } from '@users/domain/value-objects';
import { SoftDeleteUserCommand } from './soft-delete-user.command';

@CommandHandler(SoftDeleteUserCommand)
export class SoftDeleteUserHandler implements ICommandHandler<
  SoftDeleteUserCommand,
  void
> {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: IUserRepository,
  ) {}

  async execute(command: SoftDeleteUserCommand): Promise<void> {
    const { id } = command.payload;
    const user = await this.userRepository.findById(UserId.create(id));

    if (!user) {
      throw new UserNotFoundException(id);
    }

    user.softDelete();
    await this.userRepository.save(user);
  }
}
