import { BroadcastRecipientStatusEnum } from '@broadcasts/domain/enums';
import { InvalidBroadcastRecipientStatusException } from '@broadcasts/domain/exceptions';

export type BroadcastRecipientStatusValue =
  (typeof BroadcastRecipientStatusEnum)[keyof typeof BroadcastRecipientStatusEnum];

const BROADCAST_RECIPIENT_STATUS_VALUES = new Set<string>(
  Object.values(BroadcastRecipientStatusEnum),
);

const TERMINAL_STATUSES = new Set<BroadcastRecipientStatusValue>([
  BroadcastRecipientStatusEnum.DELIVERED,
  BroadcastRecipientStatusEnum.FAILED,
]);

const ALLOWED_TRANSITIONS: Record<
  BroadcastRecipientStatusValue,
  BroadcastRecipientStatusValue[]
> = {
  [BroadcastRecipientStatusEnum.PENDING]: [
    BroadcastRecipientStatusEnum.PROCESSING,
    BroadcastRecipientStatusEnum.FAILED,
  ],
  [BroadcastRecipientStatusEnum.PROCESSING]: [
    BroadcastRecipientStatusEnum.SENT,
    BroadcastRecipientStatusEnum.FAILED,
  ],
  [BroadcastRecipientStatusEnum.SENT]: [
    BroadcastRecipientStatusEnum.DELIVERED,
    BroadcastRecipientStatusEnum.FAILED,
  ],
  [BroadcastRecipientStatusEnum.DELIVERED]: [],
  [BroadcastRecipientStatusEnum.FAILED]: [],
};

export class BroadcastRecipientStatus {
  private constructor(private readonly _value: BroadcastRecipientStatusValue) {}

  static create(value: string): BroadcastRecipientStatus {
    if (!BROADCAST_RECIPIENT_STATUS_VALUES.has(value)) {
      throw new InvalidBroadcastRecipientStatusException(value);
    }

    return new BroadcastRecipientStatus(value as BroadcastRecipientStatusValue);
  }

  static pending(): BroadcastRecipientStatus {
    return new BroadcastRecipientStatus(BroadcastRecipientStatusEnum.PENDING);
  }

  static processing(): BroadcastRecipientStatus {
    return new BroadcastRecipientStatus(
      BroadcastRecipientStatusEnum.PROCESSING,
    );
  }

  static sent(): BroadcastRecipientStatus {
    return new BroadcastRecipientStatus(BroadcastRecipientStatusEnum.SENT);
  }

  static delivered(): BroadcastRecipientStatus {
    return new BroadcastRecipientStatus(BroadcastRecipientStatusEnum.DELIVERED);
  }

  static failed(): BroadcastRecipientStatus {
    return new BroadcastRecipientStatus(BroadcastRecipientStatusEnum.FAILED);
  }

  get value(): BroadcastRecipientStatusValue {
    return this._value;
  }

  get isPending(): boolean {
    return this._value === BroadcastRecipientStatusEnum.PENDING;
  }

  get isProcessing(): boolean {
    return this._value === BroadcastRecipientStatusEnum.PROCESSING;
  }

  get isSent(): boolean {
    return this._value === BroadcastRecipientStatusEnum.SENT;
  }

  get isDelivered(): boolean {
    return this._value === BroadcastRecipientStatusEnum.DELIVERED;
  }

  get isFailed(): boolean {
    return this._value === BroadcastRecipientStatusEnum.FAILED;
  }

  get isTerminal(): boolean {
    return TERMINAL_STATUSES.has(this._value);
  }

  canTransitionTo(next: BroadcastRecipientStatus): boolean {
    if (this.equals(next)) {
      return true;
    }

    return ALLOWED_TRANSITIONS[this._value].includes(next.value);
  }

  equals(other: BroadcastRecipientStatus): boolean {
    return this._value === other._value;
  }
}
