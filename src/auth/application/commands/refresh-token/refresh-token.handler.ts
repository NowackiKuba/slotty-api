import { Inject } from '@nestjs/common';
import { CommandHandler, type ICommandHandler } from '@common/application/cqrs';
import { AuthSessionReadModelMapper } from '@auth/application/mappers';
import type { AuthSessionReadModel } from '@auth/application/read-models';
import {
  InvalidRefreshTokenException,
  UserNotActiveException,
} from '@auth/domain/exceptions';
import { TokenService } from '@auth/infrastructure/tokens/token.service';
import { UserNotFoundException } from '@users/domain/exceptions/user';
import type { IUserRepository } from '@users/domain/repositories';
import { USER_REPOSITORY } from '@users/domain/tokens';
import { UserId } from '@users/domain/value-objects';
import { RefreshTokenCommand } from './refresh-token.command';

@CommandHandler(RefreshTokenCommand)
export class RefreshTokenHandler implements ICommandHandler<
  RefreshTokenCommand,
  AuthSessionReadModel
> {
  constructor(
    private readonly mapper: AuthSessionReadModelMapper,
    private readonly tokens: TokenService,
    @Inject(USER_REPOSITORY)
    private readonly userRepository: IUserRepository,
  ) {}

  async execute(command: RefreshTokenCommand): Promise<AuthSessionReadModel> {
    const { refreshToken } = command.payload;
    const userId = await this.tokens.consumeRefreshToken(refreshToken);

    if (!userId) {
      throw new InvalidRefreshTokenException();
    }

    const user = await this.userRepository.findById(UserId.create(userId));

    if (!user) {
      throw new UserNotFoundException(userId);
    }

    if (!user.status.isActive) {
      throw new UserNotActiveException(user.id.value, user.status.value);
    }

    return this.mapper.toReadModel(
      user,
      await this.tokens.issueForUser(user),
      false,
    );
  }
}
