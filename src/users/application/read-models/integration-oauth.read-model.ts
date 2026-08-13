import type { IntegrationProviderEnum } from '@users/domain/enums';

export type IntegrationOAuthStartReadModel = {
  authorizationUrl: string;
  state: string;
  provider: IntegrationProviderEnum;
};
