import { Injectable } from '@nestjs/common';
import { IntegrationTokenCipherService } from '@common/crypto';
import { UserIntegration } from '@users/domain/aggregates';
import {
  IntegrationProviderEnum,
  isIntegrationProvider,
} from '@users/domain/enums';
import {
  IntegrationStatus,
  UserId,
  UserIntegrationId,
} from '@users/domain/value-objects';
import { UserMikroOrmEntity } from '../entities/user-mikro-orm.entity';
import { UserIntegrationMikroOrmEntity } from '../entities/user-integration-mikro-orm.entity';

@Injectable()
export class UserIntegrationPersistenceMapper {
  constructor(private readonly tokenCipher: IntegrationTokenCipherService) {}

  toDomain(entity: UserIntegrationMikroOrmEntity): UserIntegration {
    return UserIntegration.reconstitute({
      id: UserIntegrationId.create(entity.id),
      userId: UserId.create(entity.user.id),
      provider: entity.provider,
      status: IntegrationStatus.create(entity.status),
      externalAccountId: entity.externalAccountId ?? null,
      accessToken: this.tokenCipher.decrypt(entity.accessToken ?? null),
      refreshToken: this.tokenCipher.decrypt(entity.refreshToken ?? null),
      expiresAt: entity.expiresAt ?? null,
      scopes: entity.scopes ?? [],
      settings: entity.settings ?? {},
      lastSyncedAt: entity.lastSyncedAt ?? null,
      errorMessage: entity.errorMessage ?? null,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
      deletedAt: entity.deletedAt ?? null,
    });
  }

  toPersistence(
    integration: UserIntegration,
    user: UserMikroOrmEntity,
  ): UserIntegrationMikroOrmEntity {
    const snapshot = integration.toSnapshot();

    return new UserIntegrationMikroOrmEntity({
      id: snapshot.id,
      user,
      provider: snapshot.provider,
      status: snapshot.status,
      externalAccountId: snapshot.externalAccountId,
      accessToken: this.tokenCipher.encrypt(snapshot.accessToken),
      refreshToken: this.tokenCipher.encrypt(snapshot.refreshToken),
      expiresAt: snapshot.expiresAt,
      scopes: snapshot.scopes,
      settings: snapshot.settings,
      lastSyncedAt: snapshot.lastSyncedAt,
      errorMessage: snapshot.errorMessage,
      createdAt: snapshot.createdAt,
      updatedAt: snapshot.updatedAt,
      deletedAt: snapshot.deletedAt,
    });
  }
}

export function parseStoredIntegrationProvider(
  provider: string,
): IntegrationProviderEnum | null {
  const normalized = provider.trim().toUpperCase();
  return isIntegrationProvider(normalized) ? normalized : null;
}
