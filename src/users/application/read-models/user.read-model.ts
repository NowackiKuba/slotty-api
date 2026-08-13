import {
  SubscriptionStatusValue,
  UserStatusValue,
} from '@users/domain/value-objects';

export type UserReadModel = {
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
};
