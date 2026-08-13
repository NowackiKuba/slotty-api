import { DomainException } from '@common/exceptions';

export class IntegrationOAuthNotConfiguredException extends DomainException {
  readonly code = 'INTEGRATION_OAUTH_NOT_CONFIGURED';
  readonly statusCode = 503;

  constructor(provider: string, missingConfigKey?: string) {
    super('Integration OAuth is not configured', { provider, missingConfigKey });
  }
}

export class InvalidIntegrationOAuthStateException extends DomainException {
  readonly code = 'INVALID_INTEGRATION_OAUTH_STATE';
  readonly statusCode = 400;

  constructor() {
    super('Invalid or expired OAuth state');
  }
}

export class IntegrationOAuthExchangeFailedException extends DomainException {
  readonly code = 'INTEGRATION_OAUTH_EXCHANGE_FAILED';
  readonly statusCode = 502;

  constructor(provider: string, reason: string) {
    super('OAuth token exchange failed', { provider, reason });
  }
}

export class IntegrationOAuthNotSupportedException extends DomainException {
  readonly code = 'INTEGRATION_OAUTH_NOT_SUPPORTED';
  readonly statusCode = 400;

  constructor(provider: string) {
    super('OAuth is not supported for this integration provider', { provider });
  }
}
