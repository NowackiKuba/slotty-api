import type { AggregateRootProps } from '@common/domain';
import type { UserId } from '@users/domain/value-objects';
import type {
  AuthIdentityId,
  AuthProvider,
} from '@auth/domain/value-objects';

export type CreateAuthIdentityProps = {
  userId: UserId;
  provider: AuthProvider;
  providerUserId: string;
  email?: string | null;
};

export type AuthIdentityProps = AggregateRootProps<AuthIdentityId> & {
  userId: UserId;
  provider: AuthProvider;
  providerUserId: string;
  email: string | null;
};

export type AuthIdentitySnapshot = {
  id: AuthIdentityId;
  userId: UserId;
  provider: AuthProvider;
  providerUserId: string;
  email: string | null;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
};
