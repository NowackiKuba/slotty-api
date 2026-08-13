import { DomainException } from '@common/exceptions';

export class InvalidUserSubscriptionStatusException extends DomainException {
  readonly code = 'INVALID_USER_SUBSCRIPTION_STATUS';
  readonly statusCode = 400;

  constructor(status: string) {
    super('Invalid user subscription status', { status });
  }
}
