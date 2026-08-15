import { AggregateRoot } from '@common/domain';
import {
  InvalidBroadcastException,
  InvalidBroadcastTransitionException,
} from '@broadcasts/domain/exceptions';
import type {
  BroadcastProps,
  BroadcastSnapshot,
  ChangeBroadcastDetailsProps,
  CreateBroadcastProps,
} from '@broadcasts/domain/types';
import { BroadcastId, BroadcastStatus } from '@broadcasts/domain/value-objects';
import { isMessageChannel, type MessageChannel } from '@messages/domain/enums';
import { InvalidMessageChannelException } from '@messages/domain/exceptions';
import { UserId } from '@users/domain/value-objects';

const MAX_MESSAGE_LENGTH = 4096;

export class Broadcast extends AggregateRoot<BroadcastId> {
  private _userId: UserId;
  private _messageText: string;
  private _targetChannel: MessageChannel;
  private _status: BroadcastStatus;
  private _scheduledAt: Date;
  private _sentCount: number;

  private constructor(props: BroadcastProps) {
    super({
      id: BroadcastId.create(props.id),
      createdAt: props.createdAt,
      updatedAt: props.updatedAt,
      deletedAt: props.deletedAt,
    });
    this._userId = UserId.create(props.userId);
    this._messageText = props.messageText;
    this._targetChannel = props.targetChannel;
    this._status = BroadcastStatus.create(props.status);
    this._scheduledAt = props.scheduledAt;
    this._sentCount = props.sentCount;
  }

  static create(props: CreateBroadcastProps): Broadcast {
    return new Broadcast({
      id: BroadcastId.create(props.id).value,
      userId: props.userId,
      messageText: requiredText(
        props.messageText,
        MAX_MESSAGE_LENGTH,
        'messageText',
      ),
      targetChannel: parseChannel(props.targetChannel),
      status: BroadcastStatus.draft().value,
      scheduledAt: parseDate(props.scheduledAt ?? new Date(), 'scheduledAt'),
      sentCount: 0,
    });
  }

  static reconstitute(props: BroadcastProps): Broadcast {
    return new Broadcast(props);
  }

  get userId(): UserId {
    return this._userId;
  }

  get messageText(): string {
    return this._messageText;
  }

  get targetChannel(): MessageChannel {
    return this._targetChannel;
  }

  get status(): BroadcastStatus {
    return this._status;
  }

  get scheduledAt(): Date {
    return this._scheduledAt;
  }

  get sentCount(): number {
    return this._sentCount;
  }

  changeDetails(details: ChangeBroadcastDetailsProps): void {
    this.assertNotDeleted('change details');
    this.assertDraft('change details');

    if (details.messageText !== undefined) {
      this._messageText = requiredText(
        details.messageText,
        MAX_MESSAGE_LENGTH,
        'messageText',
      );
    }

    if (details.targetChannel !== undefined) {
      this._targetChannel = parseChannel(details.targetChannel);
    }

    if (details.scheduledAt !== undefined) {
      this._scheduledAt = parseDate(details.scheduledAt, 'scheduledAt');
    }

    this.touch();
  }

  startSending(): void {
    this.assertNotDeleted('start sending');
    this.transitionTo(BroadcastStatus.sending());
  }

  complete(): void {
    this.assertNotDeleted('complete');
    this.transitionTo(BroadcastStatus.completed());
  }

  fail(): void {
    this.assertNotDeleted('fail');
    this.transitionTo(BroadcastStatus.failed());
  }

  incrementSentCount(): void {
    this.assertNotDeleted('increment sent count');

    if (!this._status.isSending) {
      throw new InvalidBroadcastException(
        'can only increment sent count while sending',
        { status: this._status.value },
      );
    }

    this._sentCount += 1;
    this.touch();
  }

  toSnapshot(): BroadcastSnapshot {
    return {
      id: this.id.value,
      userId: this._userId.value,
      messageText: this._messageText,
      targetChannel: this._targetChannel,
      status: this._status.value,
      scheduledAt: this._scheduledAt,
      sentCount: this._sentCount,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
      deletedAt: this.deletedAt,
    };
  }

  private transitionTo(next: BroadcastStatus): void {
    if (this._status.equals(next)) {
      return;
    }

    if (!this._status.canTransitionTo(next)) {
      throw new InvalidBroadcastTransitionException(
        this._status.value,
        next.value,
      );
    }

    this._status = next;
    this.touch();
  }

  private assertDraft(action: string): void {
    if (!this._status.isEditable) {
      throw new InvalidBroadcastException(
        `cannot ${action} a ${this._status.value} broadcast`,
        { action, status: this._status.value },
      );
    }
  }

  private assertNotDeleted(action: string): void {
    if (this.isDeleted) {
      throw new InvalidBroadcastException(
        `cannot ${action} a deleted broadcast`,
        { action },
      );
    }
  }
}

function parseChannel(value: string): MessageChannel {
  if (!isMessageChannel(value)) {
    throw new InvalidMessageChannelException(value);
  }

  return value;
}

function parseDate(value: Date, field: string): Date {
  if (!(value instanceof Date) || Number.isNaN(value.getTime())) {
    throw new InvalidBroadcastException(`${field} is invalid`, { field });
  }

  return value;
}

function requiredText(value: string, maxLength: number, field: string): string {
  if (typeof value !== 'string') {
    throw new InvalidBroadcastException(`${field} is required`, { field });
  }

  const trimmed = value.trim();

  if (!trimmed) {
    throw new InvalidBroadcastException(`${field} is required`, { field });
  }

  if (trimmed.length > maxLength) {
    throw new InvalidBroadcastException(`${field} is too long`, {
      field,
      maxLength,
    });
  }

  return trimmed;
}
