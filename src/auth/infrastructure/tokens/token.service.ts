import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import type { User } from '@users/domain/aggregates';
import { RefreshTokenStore } from './refresh-token.store';

export type AccessTokenPayload = {
  sub: string;
  email: string;
};

export type AuthTokens = {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
};

@Injectable()
export class TokenService {
  private readonly accessTtlSeconds: number;

  constructor(
    private readonly jwt: JwtService,
    private readonly refreshTokenStore: RefreshTokenStore,
    config: ConfigService,
  ) {
    this.accessTtlSeconds = Number(
      config.get<string>('JWT_ACCESS_TTL_SECONDS', '900'),
    );
  }

  async issueForUser(user: User): Promise<AuthTokens> {
    const payload: AccessTokenPayload = {
      sub: user.id.value,
      email: user.email,
    };

    const [accessToken, refreshToken] = await Promise.all([
      this.jwt.signAsync(payload, {
        expiresIn: this.accessTtlSeconds,
      }),
      this.refreshTokenStore.issue(user.id.value),
    ]);

    return {
      accessToken,
      refreshToken,
      expiresIn: this.accessTtlSeconds,
    };
  }

  async verifyAccessToken(token: string): Promise<AccessTokenPayload> {
    return this.jwt.verifyAsync<AccessTokenPayload>(token);
  }

  async consumeRefreshToken(refreshToken: string): Promise<string | null> {
    return this.refreshTokenStore.consume(refreshToken);
  }

  async revokeRefreshToken(refreshToken: string): Promise<void> {
    await this.refreshTokenStore.revoke(refreshToken);
  }
}
