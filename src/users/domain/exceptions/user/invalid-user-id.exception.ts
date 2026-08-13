import { DomainException } from '@common/exceptions';

export class InvalidUserIdException extends DomainException {
  readonly code = 'INVALID_USER_ID';
  readonly statusCode = 400;

  constructor(userId: string) {
    super('Invalid user id', { userId });
  }
}
