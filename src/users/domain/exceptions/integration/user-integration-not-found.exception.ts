import { DomainException } from '@common/exceptions';

export class UserIntegrationNotFoundException extends DomainException {
  readonly code = 'USER_INTEGRATION_NOT_FOUND';
  readonly statusCode = 404;

  constructor(context?: Record<string, unknown>) {
    super('User integration not found', context);
  }
}
