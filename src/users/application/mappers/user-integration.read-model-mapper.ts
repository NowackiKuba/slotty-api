import { Injectable } from '@nestjs/common';
import { UserIntegration } from '@users/domain/aggregates';
import type { UserIntegrationReadModel } from '../read-models';

@Injectable()
export class UserIntegrationReadModelMapper {
  toReadModel(domain: UserIntegration): UserIntegrationReadModel {
    const snapshot = domain.toSnapshot();

    return {
      id: snapshot.id,
      userId: snapshot.userId,
      provider: snapshot.provider,
      status: snapshot.status,
      externalAccountId: snapshot.externalAccountId,
      expiresAt: snapshot.expiresAt,
      scopes: snapshot.scopes,
      settings: snapshot.settings,
      lastSyncedAt: snapshot.lastSyncedAt,
      errorMessage: snapshot.errorMessage,
      isTokenExpired: domain.isTokenExpired(),
      createdAt: snapshot.createdAt,
      updatedAt: snapshot.updatedAt,
    };
  }
}
