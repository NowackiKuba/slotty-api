import { DomainException } from '@common/exceptions';

export class InvalidUserIntegrationIdException extends DomainException {
  readonly code = 'INVALID_USER_INTEGRATION_ID';
  readonly statusCode = 400;

  constructor(integrationId: string) {
    super('Invalid user integration id', { integrationId });
  }
}
