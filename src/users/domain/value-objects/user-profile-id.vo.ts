import { generateUUID } from '@common/uuid';
import { InvalidUserProfileIdException } from '@users/domain/exceptions/profile';

const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export class UserProfileId {
  private constructor(private readonly _value: string) {}

  static create(value?: string): UserProfileId {
    if (value === undefined) {
      return new UserProfileId(generateUUID());
    }

    if (!UUID_REGEX.test(value)) {
      throw new InvalidUserProfileIdException(value);
    }

    return new UserProfileId(value);
  }

  get value(): string {
    return this._value;
  }

  equals(other: UserProfileId): boolean {
    return this._value === other._value;
  }
}
