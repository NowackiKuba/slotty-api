import { BroadcastStatusEnum } from '@broadcasts/domain/enums';
import { InvalidBroadcastStatusException } from '@broadcasts/domain/exceptions';

export type BroadcastStatusValue =
  (typeof BroadcastStatusEnum)[keyof typeof BroadcastStatusEnum];

const BROADCAST_STATUS_VALUES = new Set<string>(
  Object.values(BroadcastStatusEnum),
);

const TERMINAL_STATUSES = new Set<BroadcastStatusValue>([
  BroadcastStatusEnum.COMPLETED,
  BroadcastStatusEnum.FAILED,
]);

const ALLOWED_TRANSITIONS: Record<
  BroadcastStatusValue,
  BroadcastStatusValue[]
> = {
  [BroadcastStatusEnum.DRAFT]: [BroadcastStatusEnum.SENDING],
  [BroadcastStatusEnum.SENDING]: [
    BroadcastStatusEnum.COMPLETED,
    BroadcastStatusEnum.FAILED,
  ],
  [BroadcastStatusEnum.COMPLETED]: [],
  [BroadcastStatusEnum.FAILED]: [],
};

export class BroadcastStatus {
  private constructor(private readonly _value: BroadcastStatusValue) {}

  static create(value: string): BroadcastStatus {
    if (!BROADCAST_STATUS_VALUES.has(value)) {
      throw new InvalidBroadcastStatusException(value);
    }

    return new BroadcastStatus(value as BroadcastStatusValue);
  }

  static draft(): BroadcastStatus {
    return new BroadcastStatus(BroadcastStatusEnum.DRAFT);
  }

  static sending(): BroadcastStatus {
    return new BroadcastStatus(BroadcastStatusEnum.SENDING);
  }

  static completed(): BroadcastStatus {
    return new BroadcastStatus(BroadcastStatusEnum.COMPLETED);
  }

  static failed(): BroadcastStatus {
    return new BroadcastStatus(BroadcastStatusEnum.FAILED);
  }

  get value(): BroadcastStatusValue {
    return this._value;
  }

  get isDraft(): boolean {
    return this._value === BroadcastStatusEnum.DRAFT;
  }

  get isSending(): boolean {
    return this._value === BroadcastStatusEnum.SENDING;
  }

  get isCompleted(): boolean {
    return this._value === BroadcastStatusEnum.COMPLETED;
  }

  get isFailed(): boolean {
    return this._value === BroadcastStatusEnum.FAILED;
  }

  get isTerminal(): boolean {
    return TERMINAL_STATUSES.has(this._value);
  }

  get isEditable(): boolean {
    return this.isDraft;
  }

  canTransitionTo(next: BroadcastStatus): boolean {
    if (this.equals(next)) {
      return true;
    }

    return ALLOWED_TRANSITIONS[this._value].includes(next.value);
  }

  equals(other: BroadcastStatus): boolean {
    return this._value === other._value;
  }
}
