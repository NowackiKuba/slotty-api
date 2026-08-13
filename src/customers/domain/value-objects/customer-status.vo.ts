import { InvalidCustomerStatusException } from '@customers/domain/exceptions';

export enum CustomerStatusEnum {
  GUEST = 'guest',
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  BLOCKED = 'blocked',
}

export type CustomerStatusValue =
  (typeof CustomerStatusEnum)[keyof typeof CustomerStatusEnum];

export type TCustomerStatus = CustomerStatusValue;

const CUSTOMER_STATUS_VALUES = new Set<string>(
  Object.values(CustomerStatusEnum),
);

export class CustomerStatus {
  private constructor(private readonly _value: CustomerStatusValue) {}

  static create(value: string): CustomerStatus {
    if (!CUSTOMER_STATUS_VALUES.has(value)) {
      throw new InvalidCustomerStatusException(value);
    }

    return new CustomerStatus(value as CustomerStatusValue);
  }

  static guest(): CustomerStatus {
    return new CustomerStatus(CustomerStatusEnum.GUEST);
  }

  static active(): CustomerStatus {
    return new CustomerStatus(CustomerStatusEnum.ACTIVE);
  }

  static inactive(): CustomerStatus {
    return new CustomerStatus(CustomerStatusEnum.INACTIVE);
  }

  static blocked(): CustomerStatus {
    return new CustomerStatus(CustomerStatusEnum.BLOCKED);
  }

  get value(): CustomerStatusValue {
    return this._value;
  }

  get isGuest(): boolean {
    return this._value === CustomerStatusEnum.GUEST;
  }

  get isActive(): boolean {
    return this._value === CustomerStatusEnum.ACTIVE;
  }

  get isBlocked(): boolean {
    return this._value === CustomerStatusEnum.BLOCKED;
  }

  equals(other: CustomerStatus): boolean {
    return this._value === other._value;
  }
}
