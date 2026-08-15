import { CustomerPackageStatusEnum } from '@packages/domain/enums';
import { InvalidCustomerPackageStatusException } from '@packages/domain/exceptions';

export type CustomerPackageStatusValue =
  (typeof CustomerPackageStatusEnum)[keyof typeof CustomerPackageStatusEnum];

const CUSTOMER_PACKAGE_STATUS_VALUES = new Set<string>(
  Object.values(CustomerPackageStatusEnum),
);

const TERMINAL_STATUSES = new Set<CustomerPackageStatusValue>([
  CustomerPackageStatusEnum.EXPIRED,
  CustomerPackageStatusEnum.CANCELLED,
]);

const ALLOWED_TRANSITIONS: Record<
  CustomerPackageStatusValue,
  CustomerPackageStatusValue[]
> = {
  [CustomerPackageStatusEnum.ACTIVE]: [
    CustomerPackageStatusEnum.DEPLETED,
    CustomerPackageStatusEnum.EXPIRED,
    CustomerPackageStatusEnum.CANCELLED,
  ],
  [CustomerPackageStatusEnum.DEPLETED]: [
    CustomerPackageStatusEnum.ACTIVE,
    CustomerPackageStatusEnum.EXPIRED,
    CustomerPackageStatusEnum.CANCELLED,
  ],
  [CustomerPackageStatusEnum.EXPIRED]: [CustomerPackageStatusEnum.ACTIVE],
  [CustomerPackageStatusEnum.CANCELLED]: [],
};

export class CustomerPackageStatus {
  private constructor(private readonly _value: CustomerPackageStatusValue) {}

  static create(value: string): CustomerPackageStatus {
    if (!CUSTOMER_PACKAGE_STATUS_VALUES.has(value)) {
      throw new InvalidCustomerPackageStatusException(value);
    }

    return new CustomerPackageStatus(value as CustomerPackageStatusValue);
  }

  static active(): CustomerPackageStatus {
    return new CustomerPackageStatus(CustomerPackageStatusEnum.ACTIVE);
  }

  static expired(): CustomerPackageStatus {
    return new CustomerPackageStatus(CustomerPackageStatusEnum.EXPIRED);
  }

  static depleted(): CustomerPackageStatus {
    return new CustomerPackageStatus(CustomerPackageStatusEnum.DEPLETED);
  }

  static cancelled(): CustomerPackageStatus {
    return new CustomerPackageStatus(CustomerPackageStatusEnum.CANCELLED);
  }

  get value(): CustomerPackageStatusValue {
    return this._value;
  }

  get isActive(): boolean {
    return this._value === CustomerPackageStatusEnum.ACTIVE;
  }

  get isExpired(): boolean {
    return this._value === CustomerPackageStatusEnum.EXPIRED;
  }

  get isDepleted(): boolean {
    return this._value === CustomerPackageStatusEnum.DEPLETED;
  }

  get isCancelled(): boolean {
    return this._value === CustomerPackageStatusEnum.CANCELLED;
  }

  get isTerminal(): boolean {
    return TERMINAL_STATUSES.has(this._value);
  }

  get isUsable(): boolean {
    return this.isActive;
  }

  canTransitionTo(next: CustomerPackageStatus): boolean {
    if (this.equals(next)) {
      return true;
    }

    return ALLOWED_TRANSITIONS[this._value].includes(next.value);
  }

  equals(other: CustomerPackageStatus): boolean {
    return this._value === other._value;
  }
}
