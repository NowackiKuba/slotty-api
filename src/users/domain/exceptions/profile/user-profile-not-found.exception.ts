import { DomainException } from '@common/exceptions';

export class UserProfileNotFoundException extends DomainException {
  readonly code = 'USER_PROFILE_NOT_FOUND';
  readonly statusCode = 404;

  constructor(details: { profileId?: string; userId?: string }) {
    super('User profile not found', details);
  }
}
