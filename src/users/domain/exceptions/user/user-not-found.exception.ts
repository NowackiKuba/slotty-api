import { DomainException } from '@common/exceptions';

export class UserNotFoundException extends DomainException {
  readonly code = 'USER_NOT_FOUND';
  readonly statusCode = 404;

  constructor(userId: string) {
    super('User not found', { userId });
  }
}
