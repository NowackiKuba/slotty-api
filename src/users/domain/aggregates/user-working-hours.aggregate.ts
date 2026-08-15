import { AggregateRoot } from '@common/domain';
import {
  InvalidDayOfWeekException,
  InvalidUserWorkingHoursException,
} from '@users/domain/exceptions/working-hours';
import type {
  ChangeUserWorkingHoursProps,
  CreateUserWorkingHoursProps,
  UserWorkingHoursProps,
  UserWorkingHoursSnapshot,
} from '@users/domain/types';
import { UserId, UserWorkingHoursId } from '@users/domain/value-objects';

const TIME_REGEX = /^([01]\d|2[0-3]):[0-5]\d$/;
const DAY_OFF_TIME = '00:00';

export class UserWorkingHours extends AggregateRoot<UserWorkingHoursId> {
  private _userId: UserId;
  private _dayOfWeek: number;
  private _startTime: string;
  private _endTime: string;
  private _isDayOff: boolean;

  private constructor(props: UserWorkingHoursProps) {
    super({
      id: UserWorkingHoursId.create(props.id),
      createdAt: props.createdAt,
      updatedAt: props.updatedAt,
      deletedAt: props.deletedAt,
    });
    this._userId = UserId.create(props.userId);
    this._dayOfWeek = parseDayOfWeek(props.dayOfWeek);
    this._isDayOff = props.isDayOff;
    this._startTime = parseTime(props.startTime, 'startTime');
    this._endTime = parseTime(props.endTime, 'endTime');
    assertTimeRange(this._startTime, this._endTime, this._isDayOff);
  }

  static create(props: CreateUserWorkingHoursProps): UserWorkingHours {
    const isDayOff = props.isDayOff ?? false;

    if (
      !isDayOff &&
      (props.startTime === undefined || props.endTime === undefined)
    ) {
      throw new InvalidUserWorkingHoursException(
        'startTime and endTime are required when the day is not off',
        { field: 'startTime' },
      );
    }

    return new UserWorkingHours({
      id: UserWorkingHoursId.create(props.id).value,
      userId: props.userId,
      dayOfWeek: props.dayOfWeek,
      startTime: props.startTime ?? DAY_OFF_TIME,
      endTime: props.endTime ?? DAY_OFF_TIME,
      isDayOff,
    });
  }

  static reconstitute(props: UserWorkingHoursProps): UserWorkingHours {
    return new UserWorkingHours(props);
  }

  get userId(): UserId {
    return this._userId;
  }

  get dayOfWeek(): number {
    return this._dayOfWeek;
  }

  get startTime(): string {
    return this._startTime;
  }

  get endTime(): string {
    return this._endTime;
  }

  get isDayOff(): boolean {
    return this._isDayOff;
  }

  changeHours(props: ChangeUserWorkingHoursProps): void {
    this.assertNotDeleted('change hours');

    const isDayOff = props.isDayOff ?? this._isDayOff;
    const startTime =
      props.startTime ?? (isDayOff ? DAY_OFF_TIME : this._startTime);
    const endTime = props.endTime ?? (isDayOff ? DAY_OFF_TIME : this._endTime);

    if (!isDayOff && (startTime === undefined || endTime === undefined)) {
      throw new InvalidUserWorkingHoursException(
        'startTime and endTime are required when the day is not off',
        { field: 'startTime' },
      );
    }

    this._isDayOff = isDayOff;
    this._startTime = parseTime(startTime, 'startTime');
    this._endTime = parseTime(endTime, 'endTime');
    assertTimeRange(this._startTime, this._endTime, this._isDayOff);
    this.touch();
  }

  toSnapshot(): UserWorkingHoursSnapshot {
    return {
      id: this.id.value,
      userId: this._userId.value,
      dayOfWeek: this._dayOfWeek,
      startTime: this._startTime,
      endTime: this._endTime,
      isDayOff: this._isDayOff,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
      deletedAt: this.deletedAt,
    };
  }

  private assertNotDeleted(action: string): void {
    if (this.isDeleted) {
      throw new InvalidUserWorkingHoursException(
        `cannot ${action} deleted working hours`,
        { action },
      );
    }
  }
}

export function parseDayOfWeek(value: number): number {
  if (!Number.isInteger(value) || value < 1 || value > 7) {
    throw new InvalidDayOfWeekException(value);
  }

  return value;
}

function parseTime(value: string, field: string): string {
  if (typeof value !== 'string' || !TIME_REGEX.test(value)) {
    throw new InvalidUserWorkingHoursException(
      `${field} must be a 24-hour time in HH:MM format`,
      { field, value },
    );
  }

  return value;
}

function assertTimeRange(
  startTime: string,
  endTime: string,
  isDayOff: boolean,
): void {
  if (isDayOff) {
    return;
  }

  if (endTime <= startTime) {
    throw new InvalidUserWorkingHoursException(
      'endTime must be after startTime',
      { startTime, endTime },
    );
  }
}
