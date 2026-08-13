import { DomainException } from '@common/exceptions';

export class InvalidIntegrationProviderException extends DomainException {
  readonly code = 'INVALID_INTEGRATION_PROVIDER';
  readonly statusCode = 400;

  constructor(provider: string) {
    super('Invalid integration provider', { provider });
  }
}
