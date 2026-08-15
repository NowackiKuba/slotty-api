import { Currency } from '@common/domain/enums';
import { AggregateRoot } from '@common/domain';
import { InvalidPackageTemplateException } from '@packages/domain/exceptions';
import type {
  ChangePackageTemplateDetailsProps,
  CreatePackageTemplateProps,
  PackageTemplateProps,
  PackageTemplateSnapshot,
} from '@packages/domain/types';
import { PackageTemplateId } from '@packages/domain/value-objects';
import { UserId } from '@users/domain/value-objects';

const MAX_NAME_LENGTH = 120;
const MAX_DESCRIPTION_LENGTH = 2000;
const CURRENCY_VALUES = new Set<string>(Object.values(Currency));

export class PackageTemplate extends AggregateRoot<PackageTemplateId> {
  private _userId: UserId;
  private _name: string;
  private _description?: string;
  private _sessionCount: number;
  private _price: number;
  private _currency: Currency;
  private _validityDays?: number;
  private _isActive: boolean;

  private constructor(props: PackageTemplateProps) {
    super({
      id: PackageTemplateId.create(props.id),
      createdAt: props.createdAt,
      updatedAt: props.updatedAt,
      deletedAt: props.deletedAt,
    });
    this._userId = UserId.create(props.userId);
    this._name = props.name;
    this._description = props.description ?? undefined;
    this._sessionCount = props.sessionCount;
    this._price = props.price;
    this._currency = props.currency;
    this._validityDays = props.validityDays ?? undefined;
    this._isActive = props.isActive;
  }

  static create(props: CreatePackageTemplateProps): PackageTemplate {
    return new PackageTemplate({
      id: PackageTemplateId.create(props.id).value,
      userId: props.userId,
      name: requiredText(props.name, MAX_NAME_LENGTH, 'name'),
      description: optionalText(
        props.description,
        MAX_DESCRIPTION_LENGTH,
        'description',
      ),
      sessionCount: parsePositiveInt(props.sessionCount, 'sessionCount'),
      price: parseMoney(props.price, 'price'),
      currency: parseCurrency(props.currency),
      validityDays: parseOptionalPositiveInt(
        props.validityDays,
        'validityDays',
      ),
      isActive: props.isActive ?? true,
    });
  }

  static reconstitute(props: PackageTemplateProps): PackageTemplate {
    return new PackageTemplate(props);
  }

  get userId(): UserId {
    return this._userId;
  }

  get name(): string {
    return this._name;
  }

  get description(): string | undefined {
    return this._description;
  }

  get sessionCount(): number {
    return this._sessionCount;
  }

  get price(): number {
    return this._price;
  }

  get currency(): Currency {
    return this._currency;
  }

  get validityDays(): number | undefined {
    return this._validityDays;
  }

  get isActive(): boolean {
    return this._isActive;
  }

  changeDetails(details: ChangePackageTemplateDetailsProps): void {
    this.assertNotDeleted('change details');

    if (details.name !== undefined) {
      this._name = requiredText(details.name, MAX_NAME_LENGTH, 'name');
    }

    if (details.description !== undefined) {
      this._description = optionalText(
        details.description ?? undefined,
        MAX_DESCRIPTION_LENGTH,
        'description',
      );
    }

    if (details.sessionCount !== undefined) {
      this._sessionCount = parsePositiveInt(
        details.sessionCount,
        'sessionCount',
      );
    }

    if (details.price !== undefined) {
      this._price = parseMoney(details.price, 'price');
    }

    if (details.currency !== undefined) {
      this._currency = parseCurrency(details.currency);
    }

    if (details.validityDays !== undefined) {
      this._validityDays = parseOptionalPositiveInt(
        details.validityDays,
        'validityDays',
      );
    }

    this.touch();
  }

  activate(): void {
    this.assertNotDeleted('activate');

    if (this._isActive) {
      return;
    }

    this._isActive = true;
    this.touch();
  }

  deactivate(): void {
    this.assertNotDeleted('deactivate');

    if (!this._isActive) {
      return;
    }

    this._isActive = false;
    this.touch();
  }

  toSnapshot(): PackageTemplateSnapshot {
    return {
      id: this.id.value,
      userId: this._userId.value,
      name: this._name,
      description: this._description ?? null,
      sessionCount: this._sessionCount,
      price: this._price,
      currency: this._currency,
      validityDays: this._validityDays ?? null,
      isActive: this._isActive,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
      deletedAt: this.deletedAt,
    };
  }

  private assertNotDeleted(action: string): void {
    if (this.isDeleted) {
      throw new InvalidPackageTemplateException(
        `cannot ${action} a deleted package template`,
        { action },
      );
    }
  }
}

function parseCurrency(value?: string): Currency {
  const currency = value ?? Currency.PLN;

  if (!CURRENCY_VALUES.has(currency)) {
    throw new InvalidPackageTemplateException('invalid currency', {
      currency,
    });
  }

  return currency as Currency;
}

function parsePositiveInt(value: number, field: string): number {
  if (!Number.isInteger(value) || value < 1) {
    throw new InvalidPackageTemplateException(
      `${field} must be a positive integer`,
      { field, value },
    );
  }

  return value;
}

function parseOptionalPositiveInt(
  value: number | null | undefined,
  field: string,
): number | undefined {
  if (value === undefined || value === null) {
    return undefined;
  }

  return parsePositiveInt(value, field);
}

function parseMoney(value: number, field: string): number {
  if (!Number.isInteger(value) || value < 0) {
    throw new InvalidPackageTemplateException(
      `${field} must be a non-negative integer`,
      { field, value },
    );
  }

  return value;
}

function requiredText(value: string, maxLength: number, field: string): string {
  const trimmed = optionalText(value, maxLength, field);

  if (!trimmed) {
    throw new InvalidPackageTemplateException(`${field} is required`, {
      field,
    });
  }

  return trimmed;
}

function optionalText(
  value: string | undefined,
  maxLength: number,
  field: string,
): string | undefined {
  if (value === undefined) {
    return undefined;
  }

  if (typeof value !== 'string') {
    throw new InvalidPackageTemplateException(`${field} is invalid`, {
      field,
    });
  }

  const trimmed = value.trim();

  if (!trimmed) {
    return undefined;
  }

  if (trimmed.length > maxLength) {
    throw new InvalidPackageTemplateException(`${field} is too long`, {
      field,
      maxLength,
    });
  }

  return trimmed;
}
