import { createHash, randomBytes } from 'node:crypto';
import { Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';
import { REDIS_CLIENT } from '@common/redis/redis.module';
import { IntegrationProviderEnum } from '@users/domain/enums';
import { InvalidIntegrationOAuthStateException } from '@users/domain/exceptions/integration';

type StoredOAuthState = {
  userId: string;
  provider: IntegrationProviderEnum;
};

@Injectable()
export class IntegrationOAuthStateStore {
  private readonly ttlSeconds: number;

  constructor(
    @Inject(REDIS_CLIENT) private readonly redis: Redis,
    config: ConfigService,
  ) {
    this.ttlSeconds = Number(
      config.get<string>('INTEGRATION_OAUTH_STATE_TTL_SECONDS', '600'),
    );
  }

  async issue(
    userId: string,
    provider: IntegrationProviderEnum,
  ): Promise<string> {
    const state = randomBytes(32).toString('base64url');
    const payload: StoredOAuthState = { userId, provider };

    await this.redis.set(
      this.key(state),
      JSON.stringify(payload),
      'EX',
      this.ttlSeconds,
    );

    return state;
  }

  async consume(state: string): Promise<StoredOAuthState> {
    const key = this.key(state);
    const raw = await this.redis.get(key);

    if (!raw) {
      throw new InvalidIntegrationOAuthStateException();
    }

    await this.redis.del(key);

    return JSON.parse(raw) as StoredOAuthState;
  }

  private key(state: string): string {
    const hash = createHash('sha256').update(state).digest('hex');
    return `integration:oauth:state:${hash}`;
  }
}
