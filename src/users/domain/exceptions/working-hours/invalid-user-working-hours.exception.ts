import { DomainException } from '@common/exceptions';

export class InvalidUserWorkingHoursException extends DomainException {
  readonly code = 'INVALID_USER_WORKING_HOURS';
  readonly statusCode = 400;

  constructor(message: string, details?: Record<string, unknown>) {
    super(message, details);
  }
}
