import { DomainException } from '@common/exceptions';

export class InvalidAuthProviderException extends DomainException {
  readonly code = 'INVALID_AUTH_PROVIDER';
  readonly statusCode = 400;

  constructor(provider: string) {
    super('Invalid auth provider', { provider });
  }
}
