import { DomainException } from '@common/exceptions';

export class InvalidIntegrationStatusException extends DomainException {
  readonly code = 'INVALID_INTEGRATION_STATUS';
  readonly statusCode = 400;

  constructor(status: string) {
    super('Invalid integration status', { status });
  }
}
