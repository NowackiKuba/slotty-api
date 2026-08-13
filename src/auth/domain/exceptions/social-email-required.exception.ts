import { DomainException } from '@common/exceptions';

export class SocialEmailRequiredException extends DomainException {
  readonly code = 'SOCIAL_EMAIL_REQUIRED';
  readonly statusCode = 400;

  constructor(provider: string) {
    super('Email is required to create an account from social login', {
      provider,
    });
  }
}
