import { Currency } from '@common/domain/enums';
import { AggregateRoot } from '@common/domain';
import { CustomerId } from '@customers/domain/value-objects';
import {
  InvalidCustomerPackageException,
  InvalidCustomerPackageTransitionException,
} from '@packages/domain/exceptions';
import type {
  CreateCustomerPackageProps,
  CustomerPackageProps,
  CustomerPackageSnapshot,
} from '@packages/domain/types';
import {
  CustomerPackageId,
  CustomerPackageStatus,
  PackageTemplateId,
} from '@packages/domain/value-objects';
import { UserId } from '@users/domain/value-objects';

const MAX_NAME_LENGTH = 120;
const CURRENCY_VALUES = new Set<string>(Object.values(Currency));

export class CustomerPackage extends AggregateRoot<CustomerPackageId> {
  private _userId: UserId;
  private _customerId: CustomerId;
  private _packageTemplateId?: PackageTemplateId;
  private _name: string;
  private _totalSessions: number;
  private _remainingSessions: number;
  private _pricePaid: number;
  private _currency: Currency;
  private _isPaid: boolean;
  private _status: CustomerPackageStatus;
  private _expiresAt?: Date;

  private constructor(props: CustomerPackageProps) {
    super({
      id: CustomerPackageId.create(props.id),
      createdAt: props.createdAt,
      updatedAt: props.updatedAt,
      deletedAt: props.deletedAt,
    });
    this._userId = UserId.create(props.userId);
    this._customerId = CustomerId.create(props.customerId);
    this._packageTemplateId = props.packageTemplateId
      ? PackageTemplateId.create(props.packageTemplateId)
      : undefined;
    this._name = props.name;
    this._totalSessions = props.totalSessions;
    this._remainingSessions = props.remainingSessions;
    this._pricePaid = props.pricePaid;
    this._currency = props.currency;
    this._isPaid = props.isPaid;
    this._status = CustomerPackageStatus.create(props.status);
    this._expiresAt = props.expiresAt ?? undefined;
  }

  static create(props: CreateCustomerPackageProps): CustomerPackage {
    const totalSessions = parsePositiveInt(
      props.totalSessions,
      'totalSessions',
    );
    const remainingSessions = parseRemainingSessions(
      props.remainingSessions ?? totalSessions,
      totalSessions,
    );

    return new CustomerPackage({
      id: CustomerPackageId.create(props.id).value,
      userId: props.userId,
      customerId: props.customerId,
      packageTemplateId: props.packageTemplateId ?? null,
      name: requiredText(props.name, MAX_NAME_LENGTH, 'name'),
      totalSessions,
      remainingSessions,
      pricePaid: parseMoney(props.pricePaid, 'pricePaid'),
      currency: parseCurrency(props.currency),
      isPaid: props.isPaid ?? false,
      status:
        remainingSessions === 0
          ? CustomerPackageStatus.depleted().value
          : CustomerPackageStatus.active().value,
      expiresAt: parseOptionalDate(props.expiresAt, 'expiresAt'),
    });
  }

  static reconstitute(props: CustomerPackageProps): CustomerPackage {
    return new CustomerPackage(props);
  }

  get userId(): UserId {
    return this._userId;
  }

  get customerId(): CustomerId {
    return this._customerId;
  }

  get packageTemplateId(): PackageTemplateId | undefined {
    return this._packageTemplateId;
  }

  get name(): string {
    return this._name;
  }

  get totalSessions(): number {
    return this._totalSessions;
  }

  get remainingSessions(): number {
    return this._remainingSessions;
  }

  get pricePaid(): number {
    return this._pricePaid;
  }

  get currency(): Currency {
    return this._currency;
  }

  get isPaid(): boolean {
    return this._isPaid;
  }

  get status(): CustomerPackageStatus {
    return this._status;
  }

  get expiresAt(): Date | undefined {
    return this._expiresAt;
  }

  isUsable(at: Date = new Date()): boolean {
    if (
      this.isDeleted ||
      !this._status.isUsable ||
      this._remainingSessions < 1
    ) {
      return false;
    }

    return !this.hasExpired(at);
  }

  consumeSession(at: Date = new Date()): void {
    this.assertNotDeleted('consume session');
    this.expireIfNeeded(at);

    if (!this._status.isUsable) {
      throw new InvalidCustomerPackageException(
        `cannot consume a session from a ${this._status.value} package`,
        { status: this._status.value },
      );
    }

    if (this._remainingSessions < 1) {
      throw new InvalidCustomerPackageException(
        'no remaining sessions to consume',
        { remainingSessions: this._remainingSessions },
      );
    }

    this._remainingSessions -= 1;

    if (this._remainingSessions === 0) {
      this.transitionTo(CustomerPackageStatus.depleted());
    } else {
      this.touch(at);
    }
  }

  restoreSession(): void {
    this.assertNotDeleted('restore session');

    if (this._status.isCancelled) {
      throw new InvalidCustomerPackageException(
        'cannot restore a session on a cancelled package',
        { status: this._status.value },
      );
    }

    if (this._remainingSessions >= this._totalSessions) {
      throw new InvalidCustomerPackageException(
        'cannot restore more sessions than the package total',
        {
          remainingSessions: this._remainingSessions,
          totalSessions: this._totalSessions,
        },
      );
    }

    this._remainingSessions += 1;

    if (this._status.isDepleted) {
      this.transitionTo(CustomerPackageStatus.active());
    } else {
      this.touch();
    }
  }

  markPaid(): void {
    this.assertNotDeleted('mark as paid');

    if (this._isPaid) {
      return;
    }

    this._isPaid = true;
    this.touch();
  }

  markUnpaid(): void {
    this.assertNotDeleted('mark as unpaid');

    if (!this._isPaid) {
      return;
    }

    this._isPaid = false;
    this.touch();
  }

  expire(at: Date = new Date()): void {
    this.assertNotDeleted('expire');
    this.transitionTo(CustomerPackageStatus.expired());
    this.touch(at);
  }

  cancel(): void {
    this.assertNotDeleted('cancel');
    this.transitionTo(CustomerPackageStatus.cancelled());
  }

  extend(expiresAt: Date | null): void {
    this.assertNotDeleted('extend');

    if (this._status.isCancelled) {
      throw new InvalidCustomerPackageException(
        'cannot extend a cancelled package',
        { status: this._status.value },
      );
    }

    this._expiresAt = parseOptionalDate(expiresAt, 'expiresAt');

    if (this._status.isExpired && this._remainingSessions > 0) {
      this.transitionTo(CustomerPackageStatus.active());
    } else {
      this.touch();
    }
  }

  toSnapshot(): CustomerPackageSnapshot {
    return {
      id: this.id.value,
      userId: this._userId.value,
      customerId: this._customerId.value,
      packageTemplateId: this._packageTemplateId?.value ?? null,
      name: this._name,
      totalSessions: this._totalSessions,
      remainingSessions: this._remainingSessions,
      pricePaid: this._pricePaid,
      currency: this._currency,
      isPaid: this._isPaid,
      status: this._status.value,
      expiresAt: this._expiresAt ?? null,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
      deletedAt: this.deletedAt,
    };
  }

  private expireIfNeeded(at: Date): void {
    if (!this.hasExpired(at) || this._status.isExpired) {
      return;
    }

    this.expire(at);
  }

  private hasExpired(at: Date): boolean {
    return (
      this._expiresAt !== undefined && this._expiresAt.getTime() <= at.getTime()
    );
  }

  private transitionTo(next: CustomerPackageStatus): void {
    if (this._status.equals(next)) {
      return;
    }

    if (!this._status.canTransitionTo(next)) {
      throw new InvalidCustomerPackageTransitionException(
        this._status.value,
        next.value,
      );
    }

    this._status = next;
    this.touch();
  }

  private assertNotDeleted(action: string): void {
    if (this.isDeleted) {
      throw new InvalidCustomerPackageException(
        `cannot ${action} a deleted package`,
        { action },
      );
    }
  }
}

function parseCurrency(value?: string): Currency {
  const currency = value ?? Currency.PLN;

  if (!CURRENCY_VALUES.has(currency)) {
    throw new InvalidCustomerPackageException('invalid currency', {
      currency,
    });
  }

  return currency as Currency;
}

function parsePositiveInt(value: number, field: string): number {
  if (!Number.isInteger(value) || value < 1) {
    throw new InvalidCustomerPackageException(
      `${field} must be a positive integer`,
      { field, value },
    );
  }

  return value;
}

function parseRemainingSessions(value: number, totalSessions: number): number {
  if (!Number.isInteger(value) || value < 0) {
    throw new InvalidCustomerPackageException(
      'remainingSessions must be a non-negative integer',
      { remainingSessions: value },
    );
  }

  if (value > totalSessions) {
    throw new InvalidCustomerPackageException(
      'remainingSessions cannot exceed totalSessions',
      { remainingSessions: value, totalSessions },
    );
  }

  return value;
}

function parseMoney(value: number, field: string): number {
  if (!Number.isInteger(value) || value < 0) {
    throw new InvalidCustomerPackageException(
      `${field} must be a non-negative integer`,
      { field, value },
    );
  }

  return value;
}

function parseOptionalDate(
  value: Date | null | undefined,
  field: string,
): Date | undefined {
  if (value === undefined || value === null) {
    return undefined;
  }

  if (!(value instanceof Date) || Number.isNaN(value.getTime())) {
    throw new InvalidCustomerPackageException(`${field} is invalid`, {
      field,
    });
  }

  return value;
}

function requiredText(value: string, maxLength: number, field: string): string {
  if (typeof value !== 'string') {
    throw new InvalidCustomerPackageException(`${field} is required`, {
      field,
    });
  }

  const trimmed = value.trim();

  if (!trimmed) {
    throw new InvalidCustomerPackageException(`${field} is required`, {
      field,
    });
  }

  if (trimmed.length > maxLength) {
    throw new InvalidCustomerPackageException(`${field} is too long`, {
      field,
      maxLength,
    });
  }

  return trimmed;
}
