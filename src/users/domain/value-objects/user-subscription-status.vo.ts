import { InvalidUserSubscriptionStatusException } from '@users/domain/exceptions/user';

export const SubscriptionStatuses = {
  FREE: 'free',
  PRO: 'pro',
  EXPIRED: 'expired',
} as const;

export type SubscriptionStatusValue =
  (typeof SubscriptionStatuses)[keyof typeof SubscriptionStatuses];

const SUBSCRIPTION_STATUS_VALUES = new Set<string>(
  Object.values(SubscriptionStatuses),
);

export class UserSubscriptionStatus {
  private constructor(private readonly _value: SubscriptionStatusValue) {}

  static create(value: string): UserSubscriptionStatus {
    if (!SUBSCRIPTION_STATUS_VALUES.has(value)) {
      throw new InvalidUserSubscriptionStatusException(value);
    }

    return new UserSubscriptionStatus(value as SubscriptionStatusValue);
  }

  static free(): UserSubscriptionStatus {
    return new UserSubscriptionStatus(SubscriptionStatuses.FREE);
  }

  static pro(): UserSubscriptionStatus {
    return new UserSubscriptionStatus(SubscriptionStatuses.PRO);
  }

  static expired(): UserSubscriptionStatus {
    return new UserSubscriptionStatus(SubscriptionStatuses.EXPIRED);
  }

  get value(): SubscriptionStatusValue {
    return this._value;
  }

  get isPro(): boolean {
    return this._value === SubscriptionStatuses.PRO;
  }

  equals(other: UserSubscriptionStatus): boolean {
    return this._value === other._value;
  }
}
