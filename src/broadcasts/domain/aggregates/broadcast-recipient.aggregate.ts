import { AggregateRoot } from '@common/domain';
import {
  InvalidBroadcastRecipientException,
  InvalidBroadcastRecipientTransitionException,
} from '@broadcasts/domain/exceptions';
import type {
  BroadcastRecipientProps,
  BroadcastRecipientSnapshot,
  CreateBroadcastRecipientProps,
} from '@broadcasts/domain/types';
import {
  BroadcastId,
  BroadcastRecipientId,
  BroadcastRecipientStatus,
} from '@broadcasts/domain/value-objects';
import { CustomerId } from '@customers/domain/value-objects';
import { MessageId } from '@messages/domain/value-objects';

const MAX_ERROR_LENGTH = 1000;

export class BroadcastRecipient extends AggregateRoot<BroadcastRecipientId> {
  private _broadcastId: BroadcastId;
  private _customerId: CustomerId;
  private _status: BroadcastRecipientStatus;
  private _messageId?: MessageId;
  private _sentAt?: Date;
  private _errorMessage?: string;

  private constructor(props: BroadcastRecipientProps) {
    super({
      id: BroadcastRecipientId.create(props.id),
      createdAt: props.createdAt,
      updatedAt: props.updatedAt,
      deletedAt: props.deletedAt,
    });
    this._broadcastId = BroadcastId.create(props.broadcastId);
    this._customerId = CustomerId.create(props.customerId);
    this._status = BroadcastRecipientStatus.create(props.status);
    this._messageId = props.messageId
      ? MessageId.create(props.messageId)
      : undefined;
    this._sentAt = props.sentAt ?? undefined;
    this._errorMessage = props.errorMessage ?? undefined;
  }

  static create(props: CreateBroadcastRecipientProps): BroadcastRecipient {
    return new BroadcastRecipient({
      id: BroadcastRecipientId.create(props.id).value,
      broadcastId: props.broadcastId,
      customerId: props.customerId,
      status: BroadcastRecipientStatus.pending().value,
    });
  }

  static reconstitute(props: BroadcastRecipientProps): BroadcastRecipient {
    return new BroadcastRecipient(props);
  }

  get broadcastId(): BroadcastId {
    return this._broadcastId;
  }

  get customerId(): CustomerId {
    return this._customerId;
  }

  get status(): BroadcastRecipientStatus {
    return this._status;
  }

  get messageId(): MessageId | undefined {
    return this._messageId;
  }

  get sentAt(): Date | undefined {
    return this._sentAt;
  }

  get errorMessage(): string | undefined {
    return this._errorMessage;
  }

  markProcessing(): void {
    this.assertNotDeleted('mark processing');
    this.transitionTo(BroadcastRecipientStatus.processing());
  }

  markSent(messageId: string, sentAt: Date = new Date()): void {
    this.assertNotDeleted('mark sent');
    this.transitionTo(BroadcastRecipientStatus.sent());
    this._messageId = MessageId.create(messageId);
    this._sentAt = parseDate(sentAt, 'sentAt');
    this._errorMessage = undefined;
  }

  markDelivered(): void {
    this.assertNotDeleted('mark delivered');
    this.transitionTo(BroadcastRecipientStatus.delivered());
  }

  markFailed(errorMessage: string): void {
    this.assertNotDeleted('mark failed');
    this.transitionTo(BroadcastRecipientStatus.failed());
    this._errorMessage = requiredText(
      errorMessage,
      MAX_ERROR_LENGTH,
      'errorMessage',
    );
  }

  toSnapshot(): BroadcastRecipientSnapshot {
    return {
      id: this.id.value,
      broadcastId: this._broadcastId.value,
      customerId: this._customerId.value,
      status: this._status.value,
      messageId: this._messageId?.value ?? null,
      sentAt: this._sentAt ?? null,
      errorMessage: this._errorMessage ?? null,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
      deletedAt: this.deletedAt,
    };
  }

  private transitionTo(next: BroadcastRecipientStatus): void {
    if (this._status.equals(next)) {
      return;
    }

    if (!this._status.canTransitionTo(next)) {
      throw new InvalidBroadcastRecipientTransitionException(
        this._status.value,
        next.value,
      );
    }

    this._status = next;
    this.touch();
  }

  private assertNotDeleted(action: string): void {
    if (this.isDeleted) {
      throw new InvalidBroadcastRecipientException(
        `cannot ${action} a deleted recipient`,
        { action },
      );
    }
  }
}

function parseDate(value: Date, field: string): Date {
  if (!(value instanceof Date) || Number.isNaN(value.getTime())) {
    throw new InvalidBroadcastRecipientException(`${field} is invalid`, {
      field,
    });
  }

  return value;
}

function requiredText(value: string, maxLength: number, field: string): string {
  if (typeof value !== 'string') {
    throw new InvalidBroadcastRecipientException(`${field} is required`, {
      field,
    });
  }

  const trimmed = value.trim();

  if (!trimmed) {
    throw new InvalidBroadcastRecipientException(`${field} is required`, {
      field,
    });
  }

  if (trimmed.length > maxLength) {
    throw new InvalidBroadcastRecipientException(`${field} is too long`, {
      field,
      maxLength,
    });
  }

  return trimmed;
}
