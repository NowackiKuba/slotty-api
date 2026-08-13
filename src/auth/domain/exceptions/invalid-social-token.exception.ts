import { DomainException } from '@common/exceptions';

export class InvalidSocialTokenException extends DomainException {
  readonly code = 'INVALID_SOCIAL_TOKEN';
  readonly statusCode = 401;

  constructor(provider: string, reason?: string) {
    super('Invalid social identity token', { provider, reason });
  }
}
