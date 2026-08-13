import { DomainException } from '@common/exceptions';

export class InvalidUserStatusException extends DomainException {
  readonly code = 'INVALID_USER_STATUS';
  readonly statusCode = 400;

  constructor(status: string) {
    super('Invalid user status', { status });
  }
}
