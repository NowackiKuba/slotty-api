import { generateUUID } from '@common/uuid';
import { InvalidCustomerPackageIdException } from '@packages/domain/exceptions';

const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export class CustomerPackageId {
  private constructor(private readonly _value: string) {}

  static create(value?: string): CustomerPackageId {
    if (value === undefined) {
      return new CustomerPackageId(generateUUID());
    }

    if (!UUID_REGEX.test(value)) {
      throw new InvalidCustomerPackageIdException(value);
    }

    return new CustomerPackageId(value);
  }

  get value(): string {
    return this._value;
  }

  equals(other: CustomerPackageId): boolean {
    return this._value === other._value;
  }
}
