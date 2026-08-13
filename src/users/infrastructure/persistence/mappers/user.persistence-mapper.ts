import { Injectable } from '@nestjs/common';
import { User } from '@users/domain/aggregates';
import {
  UserId,
  UserStatus,
  UserSubscriptionStatus,
  UserTimezone,
} from '@users/domain/value-objects';
import { UserMikroOrmEntity } from '../entities/user-mikro-orm.entity';

@Injectable()
export class UserPersistenceMapper {
  toDomain(entity: UserMikroOrmEntity): User {
    return User.reconstitute({
      id: UserId.create(entity.id),
      firstName: entity.firstName,
      lastName: entity.lastName,
      displayName: entity.displayName,
      email: entity.email,
      avatarUrl: entity.avatarUrl,
      emailVerified: entity.emailVerified,
      status: UserStatus.create(entity.status),
      subscriptionStatus: UserSubscriptionStatus.create(
        entity.subscriptionStatus,
      ),
      timezone: UserTimezone.create(entity.timezone),
      lastLoginAt: entity.lastLoginAt ?? null,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
      deletedAt: entity.deletedAt ?? null,
    });
  }

  toPersistence(user: User): UserMikroOrmEntity {
    const snapshot = user.toSnapshot();

    return new UserMikroOrmEntity({
      id: snapshot.id,
      firstName: snapshot.firstName,
      lastName: snapshot.lastName,
      displayName: snapshot.displayName,
      email: snapshot.email,
      avatarUrl: snapshot.avatarUrl,
      emailVerified: snapshot.emailVerified,
      status: snapshot.status,
      subscriptionStatus: snapshot.subscriptionStatus,
      timezone: snapshot.timezone,
      lastLoginAt: snapshot.lastLoginAt ?? undefined,
      createdAt: snapshot.createdAt,
      updatedAt: snapshot.updatedAt,
      deletedAt: snapshot.deletedAt,
    });
  }
}
