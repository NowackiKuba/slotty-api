import { DomainException } from '@common/exceptions';

export class InvalidUserProfileException extends DomainException {
  readonly code = 'INVALID_USER_PROFILE';
  readonly statusCode = 400;

  constructor(message: string, details?: Record<string, unknown>) {
    super(message, details);
  }
}
