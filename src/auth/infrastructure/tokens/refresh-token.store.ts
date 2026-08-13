import { createHash, randomBytes } from 'node:crypto';
import { Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';
import { REDIS_CLIENT } from '@common/redis/redis.module';

@Injectable()
export class RefreshTokenStore {
  private readonly ttlSeconds: number;

  constructor(
    @Inject(REDIS_CLIENT) private readonly redis: Redis,
    config: ConfigService,
  ) {
    this.ttlSeconds = Number(
      config.get<string>('JWT_REFRESH_TTL_SECONDS', '2592000'),
    );
  }

  async issue(userId: string): Promise<string> {
    const token = randomBytes(48).toString('base64url');
    await this.redis.set(
      this.key(token),
      userId,
      'EX',
      this.ttlSeconds,
    );
    return token;
  }

  async consume(token: string): Promise<string | null> {
    const key = this.key(token);
    const userId = await this.redis.get(key);

    if (!userId) {
      return null;
    }

    await this.redis.del(key);
    return userId;
  }

  async revoke(token: string): Promise<void> {
    await this.redis.del(this.key(token));
  }

  private key(token: string): string {
    const hash = createHash('sha256').update(token).digest('hex');
    return `auth:refresh:${hash}`;
  }
}
