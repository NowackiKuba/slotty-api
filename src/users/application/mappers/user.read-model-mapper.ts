import { Injectable } from '@nestjs/common';
import { User } from '@users/domain/aggregates';
import type { UserReadModel } from '../read-models';

@Injectable()
export class UserReadModelMapper {
  toReadModel(domain: User): UserReadModel {
    const snapshot = domain.toSnapshot();

    return {
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
      lastLoginAt: snapshot.lastLoginAt,
      createdAt: snapshot.createdAt,
      updatedAt: snapshot.updatedAt,
    };
  }
}
