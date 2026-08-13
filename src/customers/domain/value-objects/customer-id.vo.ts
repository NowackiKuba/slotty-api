import { generateUUID } from '@common/uuid';
import { InvalidCustomerIdException } from '@customers/domain/exceptions';

const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export class CustomerId {
  private constructor(private readonly _value: string) {}

  static create(value?: string): CustomerId {
    if (value === undefined) {
      return new CustomerId(generateUUID());
    }

    if (!UUID_REGEX.test(value)) {
      throw new InvalidCustomerIdException(value);
    }

    return new CustomerId(value);
  }

  get value(): string {
    return this._value;
  }

  equals(other: CustomerId): boolean {
    return this._value === other._value;
  }
}
