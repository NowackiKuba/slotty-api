import type { AggregateRootProps } from '@common/domain';
import type { IntegrationProviderEnum } from '@users/domain/enums';
import type {
  IntegrationStatus,
  IntegrationStatusValue,
  UserId,
  UserIntegrationId,
} from '@users/domain/value-objects';

export interface GoogleCalendarSettings {
  defaultCalendarId: string;
  syncToken?: string;
  timeZone?: string;
}

export interface InstagramSettings {
  instagramBusinessAccountId: string;
  facebookPageId: string;
  pageName?: string;
}

export interface WhatsAppSettings {
  phoneNumberId: string;
  wabaId: string;
  displayPhoneNumber?: string;
}

export type IntegrationSettings =
  | GoogleCalendarSettings
  | InstagramSettings
  | WhatsAppSettings
  | Record<string, never>;

export type CreateUserIntegrationProps = {
  id?: string;
  userId: string;
  provider: string;
  externalAccountId?: string;
  accessToken?: string;
  refreshToken?: string;
  expiresAt?: Date;
  scopes?: string[];
  settings?: IntegrationSettings;
};

export type UserIntegrationProps = AggregateRootProps<UserIntegrationId> & {
  userId: UserId;
  provider: IntegrationProviderEnum;
  status: IntegrationStatus;
  externalAccountId: string | null;
  accessToken: string | null;
  refreshToken: string | null;
  expiresAt: Date | null;
  scopes: string[];
  settings: IntegrationSettings;
  lastSyncedAt: Date | null;
  errorMessage: string | null;
};

export type UserIntegrationSnapshot = {
  id: string;
  userId: string;
  provider: IntegrationProviderEnum;
  status: IntegrationStatusValue;
  externalAccountId: string | null;
  accessToken: string | null;
  refreshToken: string | null;
  expiresAt: Date | null;
  scopes: string[];
  settings: IntegrationSettings;
  lastSyncedAt: Date | null;
  errorMessage: string | null;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
};
