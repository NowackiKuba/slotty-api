import { DomainException } from '@common/exceptions';

export class InvalidUserIntegrationException extends DomainException {
  readonly code = 'INVALID_USER_INTEGRATION';
  readonly statusCode = 400;

  constructor(
    message: string,
    context?: Record<string, unknown>,
  ) {
    super(message, context);
  }
}
