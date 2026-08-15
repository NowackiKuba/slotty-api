import { InvalidEventStatusException } from '@events/domain/exceptions';

export enum EventStatusEnum {
  SCHEDULED = 'SCHEDULED',
  CONFIRMED = 'CONFIRMED',
  COMPLETED = 'COMPLETED',
  CANCELLED_BY_CUSTOMER = 'CANCELLED_BY_CUSTOMER',
  CANCELLED_BY_TRAINER = 'CANCELLED_BY_TRAINER',
  NO_SHOW = 'NO_SHOW',
}

export type EventStatusValue =
  (typeof EventStatusEnum)[keyof typeof EventStatusEnum];

const EVENT_STATUS_VALUES = new Set<string>(Object.values(EventStatusEnum));

const TERMINAL_STATUSES = new Set<EventStatusValue>([
  EventStatusEnum.COMPLETED,
  EventStatusEnum.CANCELLED_BY_CUSTOMER,
  EventStatusEnum.CANCELLED_BY_TRAINER,
  EventStatusEnum.NO_SHOW,
]);

const ALLOWED_TRANSITIONS: Record<EventStatusValue, EventStatusValue[]> = {
  [EventStatusEnum.SCHEDULED]: [
    EventStatusEnum.CONFIRMED,
    EventStatusEnum.COMPLETED,
    EventStatusEnum.CANCELLED_BY_CUSTOMER,
    EventStatusEnum.CANCELLED_BY_TRAINER,
    EventStatusEnum.NO_SHOW,
  ],
  [EventStatusEnum.CONFIRMED]: [
    EventStatusEnum.COMPLETED,
    EventStatusEnum.CANCELLED_BY_CUSTOMER,
    EventStatusEnum.CANCELLED_BY_TRAINER,
    EventStatusEnum.NO_SHOW,
  ],
  [EventStatusEnum.COMPLETED]: [],
  [EventStatusEnum.CANCELLED_BY_CUSTOMER]: [],
  [EventStatusEnum.CANCELLED_BY_TRAINER]: [],
  [EventStatusEnum.NO_SHOW]: [],
};

export class EventStatus {
  private constructor(private readonly _value: EventStatusValue) {}

  static create(value: string): EventStatus {
    if (!EVENT_STATUS_VALUES.has(value)) {
      throw new InvalidEventStatusException(value);
    }

    return new EventStatus(value as EventStatusValue);
  }

  static scheduled(): EventStatus {
    return new EventStatus(EventStatusEnum.SCHEDULED);
  }

  static confirmed(): EventStatus {
    return new EventStatus(EventStatusEnum.CONFIRMED);
  }

  static completed(): EventStatus {
    return new EventStatus(EventStatusEnum.COMPLETED);
  }

  static cancelledByCustomer(): EventStatus {
    return new EventStatus(EventStatusEnum.CANCELLED_BY_CUSTOMER);
  }

  static cancelledByTrainer(): EventStatus {
    return new EventStatus(EventStatusEnum.CANCELLED_BY_TRAINER);
  }

  static noShow(): EventStatus {
    return new EventStatus(EventStatusEnum.NO_SHOW);
  }

  get value(): EventStatusValue {
    return this._value;
  }

  get isScheduled(): boolean {
    return this._value === EventStatusEnum.SCHEDULED;
  }

  get isConfirmed(): boolean {
    return this._value === EventStatusEnum.CONFIRMED;
  }

  get isCompleted(): boolean {
    return this._value === EventStatusEnum.COMPLETED;
  }

  get isCancelledByCustomer(): boolean {
    return this._value === EventStatusEnum.CANCELLED_BY_CUSTOMER;
  }

  get isCancelledByTrainer(): boolean {
    return this._value === EventStatusEnum.CANCELLED_BY_TRAINER;
  }

  get isNoShow(): boolean {
    return this._value === EventStatusEnum.NO_SHOW;
  }

  get isCancelled(): boolean {
    return this.isCancelledByCustomer || this.isCancelledByTrainer;
  }

  get isTerminal(): boolean {
    return TERMINAL_STATUSES.has(this._value);
  }

  get isOpen(): boolean {
    return this.isScheduled || this.isConfirmed;
  }

  canTransitionTo(next: EventStatus): boolean {
    if (this.equals(next)) {
      return true;
    }

    return ALLOWED_TRANSITIONS[this._value].includes(next.value);
  }

  equals(other: EventStatus): boolean {
    return this._value === other._value;
  }
}
