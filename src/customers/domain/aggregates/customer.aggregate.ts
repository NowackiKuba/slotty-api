import { AggregateRoot } from '@common/domain';
import { CustomerSource, isCustomerSource } from '@customers/domain/enums';
import {
  InvalidCustomerException,
  InvalidCustomerSourceException,
} from '@customers/domain/exceptions';
import type {
  CreateCustomerProps,
  CustomerProps,
  CustomerSnapshot,
} from '@customers/domain/types';
import { CustomerId, CustomerStatus } from '@customers/domain/value-objects';
import { UserId } from '@users/domain/value-objects';

const MAX_NAME_LENGTH = 100;
const MAX_NICKNAME_LENGTH = 40;
const MAX_NOTES_LENGTH = 2000;
const MAX_LIST_ITEM_LENGTH = 80;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_REGEX = /^\+?[0-9]{7,15}$/;

export class Customer extends AggregateRoot<CustomerId> {
  private _userId: UserId;
  private _source: CustomerSource;
  private _firstName: string;
  private _lastName?: string;
  private _nickname?: string;
  private _email?: string;
  private _phoneNumber?: string;
  private _avatarUrl?: string;
  private _instagramAccountId?: string;
  private _whatsappAccountId?: string;
  private _equipmentToBring: string[];
  private _focusAreas: string[];
  private _healthNotes?: string;
  private _generalNotes?: string;
  private _status: CustomerStatus;
  private _aiOptOut: boolean;
  private _preferredLanguage: string;
  private _totalSessionsCount: number;
  private _noShowCount: number;

  private constructor(props: CustomerProps) {
    super(props);
    this._userId = props.userId;
    this._source = props.source;
    this._firstName = props.firstName;
    this._lastName = props.lastName;
    this._nickname = props.nickname;
    this._email = props.email;
    this._phoneNumber = props.phoneNumber;
    this._avatarUrl = props.avatarUrl;
    this._instagramAccountId = props.instagramAccountId;
    this._whatsappAccountId = props.whatsappAccountId;
    this._equipmentToBring = props.equipmentToBring;
    this._focusAreas = props.focusAreas;
    this._healthNotes = props.healthNotes;
    this._generalNotes = props.generalNotes;
    this._status = props.status;
    this._aiOptOut = props.aiOptOut;
    this._preferredLanguage = props.preferredLanguage;
    this._totalSessionsCount = props.totalSessionsCount;
    this._noShowCount = props.noShowCount;
  }

  static create(props: CreateCustomerProps): Customer {
    const source = parseSource(props.source);
    const customer = new Customer({
      id: CustomerId.create(props.id),
      userId: UserId.create(props.userId),
      source,
      firstName: requiredText(props.firstName, MAX_NAME_LENGTH, 'firstName'),
      lastName: optionalText(props.lastName, MAX_NAME_LENGTH, 'lastName'),
      nickname: optionalText(props.nickname, MAX_NICKNAME_LENGTH, 'nickname'),
      email: parseEmail(props.email),
      phoneNumber: parsePhone(props.phoneNumber),
      avatarUrl: optionalText(props.avatarUrl, 2048, 'avatarUrl'),
      instagramAccountId: optionalText(
        props.instagramAccountId,
        128,
        'instagramAccountId',
      ),
      whatsappAccountId: optionalText(
        props.whatsappAccountId,
        128,
        'whatsappAccountId',
      ),
      equipmentToBring: parseStringList(props.equipmentToBring),
      focusAreas: parseStringList(props.focusAreas),
      healthNotes: optionalText(
        props.healthNotes,
        MAX_NOTES_LENGTH,
        'healthNotes',
      ),
      generalNotes: optionalText(
        props.generalNotes,
        MAX_NOTES_LENGTH,
        'generalNotes',
      ),
      status: props.status
        ? CustomerStatus.create(props.status)
        : defaultStatusForSource(source),
      aiOptOut: props.aiOptOut ?? false,
      preferredLanguage: parseLanguage(props.preferredLanguage),
      totalSessionsCount: 0,
      noShowCount: 0,
    });

    customer.assertChannelIdentity();
    return customer;
  }

  static reconstitute(props: CustomerProps): Customer {
    return new Customer(props);
  }

  get userId(): UserId {
    return this._userId;
  }

  get source(): CustomerSource {
    return this._source;
  }

  get firstName(): string {
    return this._firstName;
  }

  get lastName(): string | undefined {
    return this._lastName;
  }

  get nickname(): string | undefined {
    return this._nickname;
  }

  get email(): string | undefined {
    return this._email;
  }

  get phoneNumber(): string | undefined {
    return this._phoneNumber;
  }

  get avatarUrl(): string | undefined {
    return this._avatarUrl;
  }

  get instagramAccountId(): string | undefined {
    return this._instagramAccountId;
  }

  get whatsappAccountId(): string | undefined {
    return this._whatsappAccountId;
  }

  get equipmentToBring(): string[] {
    return [...this._equipmentToBring];
  }

  get focusAreas(): string[] {
    return [...this._focusAreas];
  }

  get healthNotes(): string | undefined {
    return this._healthNotes;
  }

  get generalNotes(): string | undefined {
    return this._generalNotes;
  }

  get status(): CustomerStatus {
    return this._status;
  }

  get aiOptOut(): boolean {
    return this._aiOptOut;
  }

  get preferredLanguage(): string {
    return this._preferredLanguage;
  }

  get totalSessionsCount(): number {
    return this._totalSessionsCount;
  }

  get noShowCount(): number {
    return this._noShowCount;
  }

  rename(firstName: string, lastName?: string): void {
    this._firstName = requiredText(firstName, MAX_NAME_LENGTH, 'firstName');
    this._lastName = optionalText(lastName, MAX_NAME_LENGTH, 'lastName');
    this.touch();
  }

  changeNickname(nickname?: string): void {
    this._nickname = optionalText(nickname, MAX_NICKNAME_LENGTH, 'nickname');
    this.touch();
  }

  changeEmail(email?: string): void {
    this._email = parseEmail(email);
    this.touch();
  }

  changePhoneNumber(phoneNumber?: string): void {
    this._phoneNumber = parsePhone(phoneNumber);
    this.touch();
  }

  changeAvatarUrl(avatarUrl?: string): void {
    this._avatarUrl = optionalText(avatarUrl, 2048, 'avatarUrl');
    this.touch();
  }

  changeSocialAccounts(accounts: {
    instagramAccountId?: string | null;
    whatsappAccountId?: string | null;
  }): void {
    if (accounts.instagramAccountId !== undefined) {
      this._instagramAccountId = optionalText(
        accounts.instagramAccountId ?? undefined,
        128,
        'instagramAccountId',
      );
    }

    if (accounts.whatsappAccountId !== undefined) {
      this._whatsappAccountId = optionalText(
        accounts.whatsappAccountId ?? undefined,
        128,
        'whatsappAccountId',
      );
    }

    this.assertChannelIdentity();
    this.touch();
  }

  changeTrainingNotes(notes: {
    equipmentToBring?: string[];
    focusAreas?: string[];
    healthNotes?: string | null;
    generalNotes?: string | null;
  }): void {
    if (notes.equipmentToBring !== undefined) {
      this._equipmentToBring = parseStringList(notes.equipmentToBring);
    }

    if (notes.focusAreas !== undefined) {
      this._focusAreas = parseStringList(notes.focusAreas);
    }

    if (notes.healthNotes !== undefined) {
      this._healthNotes = optionalText(
        notes.healthNotes ?? undefined,
        MAX_NOTES_LENGTH,
        'healthNotes',
      );
    }

    if (notes.generalNotes !== undefined) {
      this._generalNotes = optionalText(
        notes.generalNotes ?? undefined,
        MAX_NOTES_LENGTH,
        'generalNotes',
      );
    }

    this.touch();
  }

  changeStatus(status: CustomerStatus): void {
    if (this._status.equals(status)) {
      return;
    }

    this._status = status;
    this.touch();
  }

  changeAiOptOut(aiOptOut: boolean): void {
    this._aiOptOut = aiOptOut;
    this.touch();
  }

  changePreferredLanguage(language: string): void {
    this._preferredLanguage = parseLanguage(language);
    this.touch();
  }

  recordSession(): void {
    this._totalSessionsCount += 1;

    if (this._status.isGuest) {
      this._status = CustomerStatus.active();
    }

    this.touch();
  }

  recordNoShow(): void {
    this._noShowCount += 1;
    this.touch();
  }

  toSnapshot(): CustomerSnapshot {
    return {
      id: this.id.value,
      userId: this._userId.value,
      source: this._source,
      firstName: this._firstName,
      lastName: this._lastName ?? null,
      nickname: this._nickname ?? null,
      email: this._email ?? null,
      phoneNumber: this._phoneNumber ?? null,
      avatarUrl: this._avatarUrl ?? null,
      instagramAccountId: this._instagramAccountId ?? null,
      whatsappAccountId: this._whatsappAccountId ?? null,
      equipmentToBring: [...this._equipmentToBring],
      focusAreas: [...this._focusAreas],
      healthNotes: this._healthNotes ?? null,
      generalNotes: this._generalNotes ?? null,
      status: this._status.value,
      aiOptOut: this._aiOptOut,
      preferredLanguage: this._preferredLanguage,
      totalSessionsCount: this._totalSessionsCount,
      noShowCount: this._noShowCount,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
      deletedAt: this.deletedAt,
    };
  }

  private assertChannelIdentity(): void {
    if (this._source === CustomerSource.IG && !this._instagramAccountId) {
      throw new InvalidCustomerException(
        'instagram account id is required for ig source',
      );
    }

    if (this._source === CustomerSource.WHATSAPP && !this._whatsappAccountId) {
      throw new InvalidCustomerException(
        'whatsapp account id is required for whatsapp source',
      );
    }
  }
}

function defaultStatusForSource(source: CustomerSource): CustomerStatus {
  if (source === CustomerSource.IG || source === CustomerSource.WHATSAPP) {
    return CustomerStatus.guest();
  }

  return CustomerStatus.active();
}

function parseSource(value: string): CustomerSource {
  const normalized = value.trim().toLowerCase();

  if (!isCustomerSource(normalized)) {
    throw new InvalidCustomerSourceException(value);
  }

  return normalized;
}

function parseEmail(value?: string): string | undefined {
  const email = optionalText(value, 254, 'email');

  if (!email) {
    return undefined;
  }

  if (!EMAIL_REGEX.test(email)) {
    throw new InvalidCustomerException('invalid email', { email });
  }

  return email.toLowerCase();
}

function parsePhone(value?: string): string | undefined {
  if (value === undefined) {
    return undefined;
  }

  const normalized = value.replace(/[\s-]/g, '');

  if (!normalized) {
    return undefined;
  }

  if (!PHONE_REGEX.test(normalized)) {
    throw new InvalidCustomerException('invalid phone number', {
      phoneNumber: value,
    });
  }

  return normalized;
}

function parseLanguage(value?: string): string {
  const language = optionalText(value, 8, 'preferredLanguage') ?? 'pl';

  if (!/^[a-z]{2,8}$/i.test(language)) {
    throw new InvalidCustomerException('invalid preferred language', {
      preferredLanguage: value,
    });
  }

  return language.toLowerCase();
}

function parseStringList(values?: string[]): string[] {
  if (!values?.length) {
    return [];
  }

  const unique = new Set<string>();

  for (const value of values) {
    const item = value.trim();

    if (!item) {
      continue;
    }

    if (item.length > MAX_LIST_ITEM_LENGTH) {
      throw new InvalidCustomerException('list item is too long', {
        maxLength: MAX_LIST_ITEM_LENGTH,
      });
    }

    unique.add(item);
  }

  return [...unique];
}

function requiredText(value: string, maxLength: number, field: string): string {
  const trimmed = optionalText(value, maxLength, field);

  if (!trimmed) {
    throw new InvalidCustomerException(`${field} is required`, { field });
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

  const trimmed = value.trim();

  if (!trimmed) {
    return undefined;
  }

  if (trimmed.length > maxLength) {
    throw new InvalidCustomerException(`${field} is too long`, {
      field,
      maxLength,
    });
  }

  return trimmed;
}
