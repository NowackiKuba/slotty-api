import { DomainException } from '@common/exceptions';

export class InvalidAuthIdentityIdException extends DomainException {
  readonly code = 'INVALID_AUTH_IDENTITY_ID';
  readonly statusCode = 400;

  constructor(value: string) {
    super('Invalid auth identity id', { value });
  }
}
