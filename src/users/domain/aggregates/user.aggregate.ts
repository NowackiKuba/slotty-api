import { AggregateRoot } from '@common/domain';
import type {
  CreateUserProps,
  UserProps,
  UserSnapshot,
} from '@users/domain/types';
import {
  UserId,
  UserStatus,
  UserSubscriptionStatus,
  UserTimezone,
} from '@users/domain/value-objects';

export class User extends AggregateRoot<UserId> {
  private _firstName: string;
  private _lastName: string;
  private _displayName: string;
  private _email: string;
  private _avatarUrl: string;
  private _emailVerified: boolean;
  private _status: UserStatus;
  private _subscriptionStatus: UserSubscriptionStatus;
  private _timezone: UserTimezone;
  private _lastLoginAt: Date | null;

  private constructor(props: UserProps) {
    super(props);
    this._firstName = props.firstName;
    this._lastName = props.lastName;
    this._displayName = props.displayName;
    this._email = props.email;
    this._avatarUrl = props.avatarUrl;
    this._emailVerified = props.emailVerified;
    this._status = props.status;
    this._subscriptionStatus = props.subscriptionStatus;
    this._timezone = props.timezone;
    this._lastLoginAt = props.lastLoginAt ?? null;
  }

  static create(props: CreateUserProps): User {
    return new User({
      id: UserId.create(props.id),
      firstName: props.firstName,
      lastName: props.lastName,
      displayName: props.displayName,
      email: props.email,
      avatarUrl: props.avatarUrl ?? '',
      emailVerified: false,
      status: UserStatus.active(),
      subscriptionStatus: UserSubscriptionStatus.free(),
      timezone: props.timezone
        ? UserTimezone.create(props.timezone)
        : UserTimezone.default(),
    });
  }

  static reconstitute(props: UserProps): User {
    return new User(props);
  }

  get firstName(): string {
    return this._firstName;
  }

  get lastName(): string {
    return this._lastName;
  }

  get displayName(): string {
    return this._displayName;
  }

  get email(): string {
    return this._email;
  }

  get avatarUrl(): string {
    return this._avatarUrl;
  }

  get emailVerified(): boolean {
    return this._emailVerified;
  }

  get status(): UserStatus {
    return this._status;
  }

  get subscriptionStatus(): UserSubscriptionStatus {
    return this._subscriptionStatus;
  }

  get timezone(): UserTimezone {
    return this._timezone;
  }

  get lastLoginAt(): Date | null {
    return this._lastLoginAt;
  }

  rename(firstName: string, lastName: string): void {
    this._firstName = firstName;
    this._lastName = lastName;
    this.touch();
  }

  changeDisplayName(displayName: string): void {
    this._displayName = displayName;
    this.touch();
  }

  changeAvatarUrl(avatarUrl: string): void {
    this._avatarUrl = avatarUrl;
    this.touch();
  }

  changeStatus(status: UserStatus): void {
    this._status = status;
    this.touch();
  }

  changeSubscriptionStatus(status: UserSubscriptionStatus): void {
    if (this._subscriptionStatus.equals(status)) {
      return;
    }

    this._subscriptionStatus = status;
    this.touch();
  }

  changeTimezone(timezone: UserTimezone): void {
    if (this._timezone.equals(timezone)) {
      return;
    }

    this._timezone = timezone;
    this.touch();
  }

  verifyEmail(): void {
    if (this._emailVerified) {
      return;
    }

    this._emailVerified = true;
    this.touch();
  }

  recordLogin(at: Date = new Date()): void {
    this._lastLoginAt = at;
    this.touch(at);
  }

  toSnapshot(): UserSnapshot {
    return {
      id: this.id.value,
      firstName: this._firstName,
      lastName: this._lastName,
      displayName: this._displayName,
      email: this._email,
      avatarUrl: this._avatarUrl,
      emailVerified: this._emailVerified,
      status: this._status.value,
      subscriptionStatus: this._subscriptionStatus.value,
      timezone: this._timezone.value,
      lastLoginAt: this._lastLoginAt,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
      deletedAt: this.deletedAt,
    };
  }
}
