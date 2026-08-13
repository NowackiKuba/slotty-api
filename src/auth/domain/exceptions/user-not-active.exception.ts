import { DomainException } from '@common/exceptions';

export class UserNotActiveException extends DomainException {
  readonly code = 'USER_NOT_ACTIVE';
  readonly statusCode = 403;

  constructor(userId: string, status: string) {
    super('User account is not active', { userId, status });
  }
}
