import { InvalidUserTimezoneException } from '@users/domain/exceptions/user';

const DEFAULT_TIMEZONE = 'UTC';

export class UserTimezone {
  private constructor(private readonly _value: string) {}

  static default(): UserTimezone {
    return new UserTimezone(DEFAULT_TIMEZONE);
  }

  static create(value: string): UserTimezone {
    const trimmed = value.trim();

    if (!trimmed || !UserTimezone.isValidIanaTimezone(trimmed)) {
      throw new InvalidUserTimezoneException({ timezone: value });
    }

    return new UserTimezone(trimmed);
  }

  static isValidIanaTimezone(value: string): boolean {
    try {
      Intl.DateTimeFormat(undefined, { timeZone: value });
      return true;
    } catch {
      return false;
    }
  }

  get value(): string {
    return this._value;
  }

  equals(other: UserTimezone): boolean {
    return this._value === other._value;
  }
}
