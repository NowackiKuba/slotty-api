import { Command } from '@common/application/cqrs';
import type { IntegrationSettings } from '@users/domain/types';

export type ConnectUserIntegrationCommandPayload = {
  userId: string;
  provider: string;
  externalAccountId?: string | null;
  accessToken: string;
  refreshToken?: string | null;
  expiresAt?: Date | null;
  scopes?: string[];
  settings?: IntegrationSettings | unknown;
};

export class ConnectUserIntegrationCommand extends Command<ConnectUserIntegrationCommandPayload> {
  constructor(payload: ConnectUserIntegrationCommandPayload) {
    super(payload);
  }
}
