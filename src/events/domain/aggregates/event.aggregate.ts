import { Currency } from '@common/domain/enums';
import { AggregateRoot } from '@common/domain';
import { CustomerId } from '@customers/domain/value-objects';
import {
  EventSource,
  EventType,
  isEventSource,
  isEventType,
  isSessionEventType,
} from '@events/domain/enums';
import {
  InvalidEventException,
  InvalidEventSourceException,
  InvalidEventTransitionException,
  InvalidEventTypeException,
} from '@events/domain/exceptions';
import type {
  ChangeEventDetailsProps,
  ChangeEventPricingProps,
  ChangeEventSessionNotesProps,
  CreateEventProps,
  EventProps,
  EventSnapshot,
} from '@events/domain/types';
import { EventId, EventStatus } from '@events/domain/value-objects';
import { isPaymentMethod, type PaymentMethod } from '@users/domain/enums';
import { UserId } from '@users/domain/value-objects';

const MAX_TITLE_LENGTH = 200;
const MAX_DESCRIPTION_LENGTH = 2000;
const MAX_LOCATION_LENGTH = 500;
const MAX_NOTES_LENGTH = 2000;
const MAX_GOOGLE_ID_LENGTH = 256;
const CURRENCY_VALUES = new Set<string>(Object.values(Currency));

export class Event extends AggregateRoot<EventId> {
  private _userId: UserId;
  private _customerId?: CustomerId;
  private _status: EventStatus;
  private _type: EventType;
  private _isPaymentApplicableYet: boolean;
  private _price: number;
  private _paymentMethod?: PaymentMethod;
  private _currency: Currency;
  private _location?: string;
  private _source: EventSource;
  private _isPaid: boolean;
  private _title: string;
  private _description?: string;
  private _startDate: Date;
  private _endDate: Date;
  private _googleCalendarId?: string;
  private _googleEventId?: string;
  private _preSessionPlan?: string;
  private _postSessionNotes?: string;

  private constructor(props: EventProps) {
    super(props);
    this._userId = props.userId;
    this._customerId = props.customerId;
    this._status = props.status;
    this._type = props.type;
    this._isPaymentApplicableYet = props.isPaymentApplicableYet;
    this._price = props.price;
    this._paymentMethod = props.paymentMethod;
    this._currency = props.currency;
    this._location = props.location;
    this._source = props.source;
    this._isPaid = props.isPaid;
    this._title = props.title;
    this._description = props.description;
    this._startDate = props.startDate;
    this._endDate = props.endDate;
    this._googleCalendarId = props.googleCalendarId;
    this._googleEventId = props.googleEventId;
    this._preSessionPlan = props.preSessionPlan;
    this._postSessionNotes = props.postSessionNotes;
  }

  static create(props: CreateEventProps): Event {
    const type = parseType(props.type);
    const source = parseSource(props.source);
    const event = new Event({
      id: EventId.create(props.id),
      userId: UserId.create(props.userId),
      customerId: props.customerId
        ? CustomerId.create(props.customerId)
        : undefined,
      status: props.status
        ? EventStatus.create(props.status)
        : EventStatus.scheduled(),
      type,
      isPaymentApplicableYet:
        props.isPaymentApplicableYet ?? type !== EventType.PERSONAL_BLOCK,
      price: parsePrice(props.price),
      paymentMethod: parsePaymentMethod(props.paymentMethod),
      currency: parseCurrency(props.currency),
      location: optionalText(props.location, MAX_LOCATION_LENGTH, 'location'),
      source,
      isPaid: props.isPaid ?? false,
      title: requiredText(props.title, MAX_TITLE_LENGTH, 'title'),
      description: optionalText(
        props.description,
        MAX_DESCRIPTION_LENGTH,
        'description',
      ),
      startDate: parseDate(props.startDate, 'startDate'),
      endDate: parseDate(props.endDate, 'endDate'),
      googleCalendarId: optionalText(
        props.googleCalendarId,
        MAX_GOOGLE_ID_LENGTH,
        'googleCalendarId',
      ),
      googleEventId: optionalText(
        props.googleEventId,
        MAX_GOOGLE_ID_LENGTH,
        'googleEventId',
      ),
      preSessionPlan: optionalText(
        props.preSessionPlan,
        MAX_NOTES_LENGTH,
        'preSessionPlan',
      ),
      postSessionNotes: optionalText(
        props.postSessionNotes,
        MAX_NOTES_LENGTH,
        'postSessionNotes',
      ),
    });

    event.assertSchedule();
    event.assertGoogleSyncIdentity();
    event.assertPersonalBlockPayment();
    return event;
  }

  static reconstitute(props: EventProps): Event {
    return new Event(props);
  }

  get userId(): UserId {
    return this._userId;
  }

  get customerId(): CustomerId | undefined {
    return this._customerId;
  }

  get status(): EventStatus {
    return this._status;
  }

  get type(): EventType {
    return this._type;
  }

  get isPaymentApplicableYet(): boolean {
    return this._isPaymentApplicableYet;
  }

  get price(): number {
    return this._price;
  }

  get paymentMethod(): PaymentMethod | undefined {
    return this._paymentMethod;
  }

  get currency(): Currency {
    return this._currency;
  }

  get location(): string | undefined {
    return this._location;
  }

  get source(): EventSource {
    return this._source;
  }

  get isPaid(): boolean {
    return this._isPaid;
  }

  get title(): string {
    return this._title;
  }

  get description(): string | undefined {
    return this._description;
  }

  get startDate(): Date {
    return this._startDate;
  }

  get endDate(): Date {
    return this._endDate;
  }

  get googleCalendarId(): string | undefined {
    return this._googleCalendarId;
  }

  get googleEventId(): string | undefined {
    return this._googleEventId;
  }

  get preSessionPlan(): string | undefined {
    return this._preSessionPlan;
  }

  get postSessionNotes(): string | undefined {
    return this._postSessionNotes;
  }

  reschedule(startDate: Date, endDate: Date): void {
    this.assertOpen('reschedule');
    this._startDate = parseDate(startDate, 'startDate');
    this._endDate = parseDate(endDate, 'endDate');
    this.assertSchedule();
    this.touch();
  }

  changeDetails(details: ChangeEventDetailsProps): void {
    if (details.title !== undefined) {
      this._title = requiredText(details.title, MAX_TITLE_LENGTH, 'title');
    }

    if (details.description !== undefined) {
      this._description = optionalText(
        details.description ?? undefined,
        MAX_DESCRIPTION_LENGTH,
        'description',
      );
    }

    if (details.location !== undefined) {
      this._location = optionalText(
        details.location ?? undefined,
        MAX_LOCATION_LENGTH,
        'location',
      );
    }

    this.touch();
  }

  changeType(type: string): void {
    this.assertOpen('change type');
    const nextType = parseType(type);

    if (nextType === EventType.PERSONAL_BLOCK) {
      this._isPaid = false;
      this._isPaymentApplicableYet = false;
      this._price = 0;
      this._paymentMethod = undefined;
    } else if (this._type === EventType.PERSONAL_BLOCK) {
      this._isPaymentApplicableYet = true;
    }

    this._type = nextType;
    this.touch();
  }

  assignCustomer(customerId: string): void {
    this._customerId = CustomerId.create(customerId);
    this.touch();
  }

  unassignCustomer(): void {
    this._customerId = undefined;
    this.touch();
  }

  changePricing(pricing: ChangeEventPricingProps): void {
    if (pricing.price !== undefined) {
      this._price = parsePrice(pricing.price);
    }

    if (pricing.currency !== undefined) {
      this._currency = parseCurrency(pricing.currency);
    }

    if (pricing.paymentMethod !== undefined) {
      this._paymentMethod = parsePaymentMethod(
        pricing.paymentMethod ?? undefined,
      );
    }

    if (pricing.isPaymentApplicableYet !== undefined) {
      this._isPaymentApplicableYet = pricing.isPaymentApplicableYet;
    }

    this.assertPersonalBlockPayment();
    this.touch();
  }

  markPaid(): void {
    this.assertNotPersonalBlock('mark as paid');

    if (this._isPaid) {
      return;
    }

    this._isPaid = true;
    this._isPaymentApplicableYet = true;
    this.touch();
  }

  markUnpaid(): void {
    if (!this._isPaid) {
      return;
    }

    this._isPaid = false;
    this.touch();
  }

  confirm(): void {
    this.transitionTo(EventStatus.confirmed());
  }

  complete(): void {
    this.transitionTo(EventStatus.completed());
  }

  cancelByCustomer(): void {
    this.assertSession('cancel by customer');
    this.transitionTo(EventStatus.cancelledByCustomer());
  }

  cancelByTrainer(): void {
    this.transitionTo(EventStatus.cancelledByTrainer());
  }

  markNoShow(): void {
    this.assertSession('mark as no-show');
    this.transitionTo(EventStatus.noShow());
  }

  changeSessionNotes(notes: ChangeEventSessionNotesProps): void {
    if (notes.preSessionPlan !== undefined) {
      this._preSessionPlan = optionalText(
        notes.preSessionPlan ?? undefined,
        MAX_NOTES_LENGTH,
        'preSessionPlan',
      );
    }

    if (notes.postSessionNotes !== undefined) {
      this._postSessionNotes = optionalText(
        notes.postSessionNotes ?? undefined,
        MAX_NOTES_LENGTH,
        'postSessionNotes',
      );
    }

    this.touch();
  }

  linkGoogleCalendar(googleCalendarId: string, googleEventId: string): void {
    this._googleCalendarId = requiredText(
      googleCalendarId,
      MAX_GOOGLE_ID_LENGTH,
      'googleCalendarId',
    );
    this._googleEventId = requiredText(
      googleEventId,
      MAX_GOOGLE_ID_LENGTH,
      'googleEventId',
    );
    this.touch();
  }

  unlinkGoogleCalendar(): void {
    this._googleCalendarId = undefined;
    this._googleEventId = undefined;
    this.touch();
  }

  toSnapshot(): EventSnapshot {
    return {
      id: this.id.value,
      userId: this._userId.value,
      customerId: this._customerId?.value ?? null,
      status: this._status.value,
      type: this._type,
      isPaymentApplicableYet: this._isPaymentApplicableYet,
      price: this._price,
      paymentMethod: this._paymentMethod ?? null,
      currency: this._currency,
      location: this._location ?? null,
      source: this._source,
      isPaid: this._isPaid,
      title: this._title,
      description: this._description ?? null,
      startDate: this._startDate,
      endDate: this._endDate,
      googleCalendarId: this._googleCalendarId ?? null,
      googleEventId: this._googleEventId ?? null,
      preSessionPlan: this._preSessionPlan ?? null,
      postSessionNotes: this._postSessionNotes ?? null,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
      deletedAt: this.deletedAt,
    };
  }

  private transitionTo(next: EventStatus): void {
    if (this._status.equals(next)) {
      return;
    }

    if (!this._status.canTransitionTo(next)) {
      throw new InvalidEventTransitionException(this._status.value, next.value);
    }

    this._status = next;
    this.touch();
  }

  private assertOpen(action: string): void {
    if (!this._status.isOpen) {
      throw new InvalidEventException(
        `cannot ${action} a ${this._status.value} event`,
        {
          action,
          status: this._status.value,
        },
      );
    }
  }

  private assertSession(action: string): void {
    if (!isSessionEventType(this._type)) {
      throw new InvalidEventException(
        `cannot ${action} a ${this._type} event`,
        {
          action,
          type: this._type,
        },
      );
    }
  }

  private assertNotPersonalBlock(action: string): void {
    if (this._type === EventType.PERSONAL_BLOCK) {
      throw new InvalidEventException(`cannot ${action} a personal block`, {
        action,
        type: this._type,
      });
    }
  }

  private assertSchedule(): void {
    if (this._endDate.getTime() <= this._startDate.getTime()) {
      throw new InvalidEventException('end date must be after start date', {
        startDate: this._startDate,
        endDate: this._endDate,
      });
    }
  }

  private assertGoogleSyncIdentity(): void {
    if (this._source === EventSource.GOOGLE_SYNC && !this._googleEventId) {
      throw new InvalidEventException(
        'google event id is required for google sync source',
      );
    }
  }

  private assertPersonalBlockPayment(): void {
    if (this._type !== EventType.PERSONAL_BLOCK) {
      return;
    }

    if (this._isPaid || this._isPaymentApplicableYet || this._price > 0) {
      throw new InvalidEventException(
        'payment is not applicable to personal block',
      );
    }
  }
}

function parseType(value: string): EventType {
  if (!isEventType(value)) {
    throw new InvalidEventTypeException(value);
  }

  return value;
}

function parseSource(value: string): EventSource {
  if (!isEventSource(value)) {
    throw new InvalidEventSourceException(value);
  }

  return value;
}

function parsePrice(value: number): number {
  if (!Number.isInteger(value) || value < 0) {
    throw new InvalidEventException('price must be a non-negative integer', {
      price: value,
    });
  }

  return value;
}

function parseCurrency(value: string): Currency {
  if (!CURRENCY_VALUES.has(value)) {
    throw new InvalidEventException('invalid currency', { currency: value });
  }

  return value as Currency;
}

function parsePaymentMethod(value?: string): PaymentMethod | undefined {
  if (value === undefined) {
    return undefined;
  }

  if (!isPaymentMethod(value)) {
    throw new InvalidEventException('invalid payment method', {
      paymentMethod: value,
    });
  }

  return value;
}

function parseDate(value: Date, field: string): Date {
  if (!(value instanceof Date) || Number.isNaN(value.getTime())) {
    throw new InvalidEventException(`${field} is invalid`, { field });
  }

  return value;
}

function requiredText(value: string, maxLength: number, field: string): string {
  const trimmed = optionalText(value, maxLength, field);

  if (!trimmed) {
    throw new InvalidEventException(`${field} is required`, { field });
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
    throw new InvalidEventException(`${field} is too long`, {
      field,
      maxLength,
    });
  }

  return trimmed;
}
