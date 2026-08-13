import { generateUUID } from '@common/uuid';
import { InvalidAuthIdentityIdException } from '@auth/domain/exceptions';

const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export class AuthIdentityId {
  private constructor(private readonly _value: string) {}

  static create(value?: string): AuthIdentityId {
    if (value === undefined) {
      return new AuthIdentityId(generateUUID());
    }

    if (!UUID_REGEX.test(value)) {
      throw new InvalidAuthIdentityIdException(value);
    }

    return new AuthIdentityId(value);
  }

  get value(): string {
    return this._value;
  }

  equals(other: AuthIdentityId): boolean {
    return this._value === other._value;
  }
}
