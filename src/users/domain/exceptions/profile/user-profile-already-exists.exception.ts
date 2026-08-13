import { DomainException } from '@common/exceptions';

export class UserProfileAlreadyExistsException extends DomainException {
  readonly code = 'USER_PROFILE_ALREADY_EXISTS';
  readonly statusCode = 409;

  constructor(userId: string) {
    super('User profile already exists', { userId });
  }
}
