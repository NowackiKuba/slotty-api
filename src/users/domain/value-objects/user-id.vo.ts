import { generateUUID } from '@common/uuid';
import { InvalidUserIdException } from '@users/domain/exceptions/user';

const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export class UserId {
  private constructor(private readonly _value: string) {}

  static create(value?: string): UserId {
    if (value === undefined) {
      return new UserId(generateUUID());
    }

    if (!UUID_REGEX.test(value)) {
      throw new InvalidUserIdException(value);
    }

    return new UserId(value);
  }

  get value(): string {
    return this._value;
  }

  equals(other: UserId): boolean {
    return this._value === other._value;
  }
}
