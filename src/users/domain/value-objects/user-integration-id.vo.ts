import { generateUUID } from '@common/uuid';
import { InvalidUserIntegrationIdException } from '@users/domain/exceptions/integration';

const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export class UserIntegrationId {
  private constructor(private readonly _value: string) {}

  static create(value?: string): UserIntegrationId {
    if (value === undefined) {
      return new UserIntegrationId(generateUUID());
    }

    if (!UUID_REGEX.test(value)) {
      throw new InvalidUserIntegrationIdException(value);
    }

    return new UserIntegrationId(value);
  }

  get value(): string {
    return this._value;
  }

  equals(other: UserIntegrationId): boolean {
    return this._value === other._value;
  }
}
