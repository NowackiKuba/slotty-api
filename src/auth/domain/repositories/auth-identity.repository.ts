import type { AuthIdentity } from '@auth/domain/aggregates';
import type { AuthProvider } from '@auth/domain/value-objects';
import type { UserId } from '@users/domain/value-objects';

export interface IAuthIdentityRepository {
  findByProvider(
    provider: AuthProvider,
    providerUserId: string,
  ): Promise<AuthIdentity | null>;
  findByUserId(userId: UserId): Promise<AuthIdentity[]>;
  save(identity: AuthIdentity): Promise<void>;
}
