import { Injectable } from '@nestjs/common';
import { AuthIdentity } from '@auth/domain/aggregates';
import {
  AuthIdentityId,
  AuthProvider,
} from '@auth/domain/value-objects';
import { UserId } from '@users/domain/value-objects';
import { AuthIdentityMikroOrmEntity } from '../persistence/auth-identity-mikro-orm.entity';

@Injectable()
export class AuthIdentityPersistenceMapper {
  toDomain(entity: AuthIdentityMikroOrmEntity): AuthIdentity {
    return AuthIdentity.reconstitute({
      id: AuthIdentityId.create(entity.id),
      userId: UserId.create(entity.userId),
      provider: AuthProvider.create(entity.provider),
      providerUserId: entity.providerUserId,
      email: entity.email ?? null,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
      deletedAt: entity.deletedAt ?? null,
    });
  }

  toPersistence(identity: AuthIdentity): AuthIdentityMikroOrmEntity {
    const snapshot = identity.toSnapshot();

    return new AuthIdentityMikroOrmEntity({
      id: snapshot.id.value,
      userId: snapshot.userId.value,
      provider: snapshot.provider.value,
      providerUserId: snapshot.providerUserId,
      email: snapshot.email,
      createdAt: snapshot.createdAt,
      updatedAt: snapshot.updatedAt,
      deletedAt: snapshot.deletedAt,
    });
  }
}
