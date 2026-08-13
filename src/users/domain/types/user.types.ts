import type { AggregateRootProps } from '@common/domain';
import type {
  SubscriptionStatusValue,
  UserId,
  UserStatus,
  UserStatusValue,
  UserSubscriptionStatus,
  UserTimezone,
} from '@users/domain/value-objects';

export type CreateUserProps = {
  id?: string;
  firstName: string;
  lastName: string;
  displayName: string;
  email: string;
  avatarUrl?: string;
  timezone?: string;
};

export type UserProps = AggregateRootProps<UserId> & {
  firstName: string;
  lastName: string;
  displayName: string;
  email: string;
  avatarUrl: string;
  emailVerified: boolean;
  status: UserStatus;
  subscriptionStatus: UserSubscriptionStatus;
  timezone: UserTimezone;
  lastLoginAt?: Date | null;
};

export type UserSnapshot = {
  id: string;
  firstName: string;
  lastName: string;
  displayName: string;
  email: string;
  avatarUrl: string;
  emailVerified: boolean;
  status: UserStatusValue;
  subscriptionStatus: SubscriptionStatusValue;
  timezone: string;
  lastLoginAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
};
