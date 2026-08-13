import { Inject } from '@nestjs/common';
import { CommandHandler, type ICommandHandler } from '@common/application/cqrs';
import { UserReadModelMapper } from '@users/application/mappers';
import type { UserReadModel } from '@users/application/read-models';
import { UserNotFoundException } from '@users/domain/exceptions/user';
import type { IUserRepository } from '@users/domain/repositories';
import { USER_REPOSITORY } from '@users/domain/tokens';
import { UserId } from '@users/domain/value-objects';
import { RecordUserLoginCommand } from './record-user-login.command';

@CommandHandler(RecordUserLoginCommand)
export class RecordUserLoginHandler implements ICommandHandler<
  RecordUserLoginCommand,
  UserReadModel
> {
  constructor(
    private readonly mapper: UserReadModelMapper,
    @Inject(USER_REPOSITORY)
    private readonly userRepository: IUserRepository,
  ) {}

  async execute(command: RecordUserLoginCommand): Promise<UserReadModel> {
    const { id, at } = command.payload;
    const user = await this.userRepository.findById(UserId.create(id));

    if (!user) {
      throw new UserNotFoundException(id);
    }

    user.recordLogin(at);
    await this.userRepository.save(user);

    return this.mapper.toReadModel(user);
  }
}
