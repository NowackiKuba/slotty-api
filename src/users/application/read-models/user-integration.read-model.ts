import type { IntegrationProviderEnum } from '@users/domain/enums';
import type { IntegrationSettings } from '@users/domain/types';
import type { IntegrationStatusValue } from '@users/domain/value-objects';

export type UserIntegrationReadModel = {
  id: string;
  userId: string;
  provider: IntegrationProviderEnum;
  status: IntegrationStatusValue;
  externalAccountId: string | null;
  expiresAt: Date | null;
  scopes: string[];
  settings: IntegrationSettings;
  lastSyncedAt: Date | null;
  errorMessage: string | null;
  isTokenExpired: boolean;
  createdAt: Date;
  updatedAt: Date;
};
