import { Injectable } from '@nestjs/common';
import type { AuthTokens } from '@auth/infrastructure/tokens/token.service';
import { UserReadModelMapper } from '@users/application/mappers';
import type { User } from '@users/domain/aggregates';
import type { AuthSessionReadModel } from '../read-models';

@Injectable()
export class AuthSessionReadModelMapper {
  constructor(private readonly userMapper: UserReadModelMapper) {}

  toReadModel(
    user: User,
    tokens: AuthTokens,
    isNewUser: boolean,
  ): AuthSessionReadModel {
    return {
      isNewUser,
      tokens: {
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
        expiresIn: tokens.expiresIn,
      },
      user: this.userMapper.toReadModel(user),
    };
  }
}
