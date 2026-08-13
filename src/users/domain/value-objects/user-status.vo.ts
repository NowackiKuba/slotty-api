import { InvalidUserStatusException } from '@users/domain/exceptions/user';

export const UserStatuses = {
  ACTIVE: 'active',
  INACTIVE: 'inactive',
  SUSPENDED: 'suspended',
  BANNED: 'banned',
} as const;

export type UserStatusValue = (typeof UserStatuses)[keyof typeof UserStatuses];

const USER_STATUS_VALUES = new Set<string>(Object.values(UserStatuses));

export class UserStatus {
  private constructor(private readonly _value: UserStatusValue) {}

  static create(value: string): UserStatus {
    if (!USER_STATUS_VALUES.has(value)) {
      throw new InvalidUserStatusException(value);
    }

    return new UserStatus(value as UserStatusValue);
  }

  static active(): UserStatus {
    return new UserStatus(UserStatuses.ACTIVE);
  }

  get value(): UserStatusValue {
    return this._value;
  }

  get isActive(): boolean {
    return this._value === UserStatuses.ACTIVE;
  }

  equals(other: UserStatus): boolean {
    return this._value === other._value;
  }
}
