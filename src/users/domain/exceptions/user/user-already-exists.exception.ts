import { DomainException } from '@common/exceptions';

export class UserAlreadyExistsException extends DomainException {
  readonly code = 'USER_ALREADY_EXISTS';
  readonly statusCode = 409;

  constructor(details: { email?: string; displayName?: string }) {
    super('User already exists', details);
  }
}
