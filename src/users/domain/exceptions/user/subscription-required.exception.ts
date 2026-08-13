import { DomainException } from '@common/exceptions';

export class SubscriptionRequiredException extends DomainException {
  readonly code = 'SUBSCRIPTION_REQUIRED';
  readonly statusCode = 403;

  constructor(feature?: string) {
    super(
      feature
        ? `Pro subscription required for ${feature}`
        : 'Pro subscription required',
      feature ? { feature } : undefined,
    );
  }
}
