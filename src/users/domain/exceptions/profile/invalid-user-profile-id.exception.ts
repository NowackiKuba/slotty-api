import { DomainException } from '@common/exceptions';

export class InvalidUserProfileIdException extends DomainException {
  readonly code = 'INVALID_USER_PROFILE_ID';
  readonly statusCode = 400;

  constructor(profileId: string) {
    super('Invalid user profile id', { profileId });
  }
}
