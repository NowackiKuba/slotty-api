import type { IntegrationSettings } from '@users/domain/types';
import type { IntegrationProviderEnum } from '@users/domain/enums';

export type IntegrationOAuthConnection = {
  accessToken: string;
  refreshToken?: string | null;
  expiresAt?: Date | null;
  scopes: string[];
  externalAccountId: string | null;
  settings: IntegrationSettings;
};

export interface IntegrationOAuthClient {
  readonly provider: IntegrationProviderEnum;
  buildAuthorizationUrl(state: string): string;
  exchangeCode(code: string): Promise<IntegrationOAuthConnection>;
}

export type IntegrationOAuthStartResult = {
  authorizationUrl: string;
  state: string;
  provider: IntegrationProviderEnum;
};
