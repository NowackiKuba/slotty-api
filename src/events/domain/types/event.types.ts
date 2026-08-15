import type { Currency } from '@common/domain/enums';
import type { AggregateRootProps } from '@common/domain';
import type { CustomerId } from '@customers/domain/value-objects';
import type { EventSource, EventType } from '@events/domain/enums';
import type {
  EventId,
  EventStatus,
  EventStatusValue,
} from '@events/domain/value-objects';
import type { PaymentMethod } from '@users/domain/enums';
import type { UserId } from '@users/domain/value-objects';

export type CreateEventProps = {
  id?: string;
  userId: string;
  customerId?: string;
  status?: string;
  type: string;
  isPaymentApplicableYet?: boolean;
  price: number;
  paymentMethod?: string;
  currency: string;
  location?: string;
  source: string;
  isPaid?: boolean;
  title: string;
  description?: string;
  startDate: Date;
  endDate: Date;
  googleCalendarId?: string;
  googleEventId?: string;
  preSessionPlan?: string;
  postSessionNotes?: string;
};

export type EventProps = AggregateRootProps<EventId> & {
  userId: UserId;
  customerId?: CustomerId;
  status: EventStatus;
  type: EventType;
  isPaymentApplicableYet: boolean;
  price: number;
  paymentMethod?: PaymentMethod;
  currency: Currency;
  location?: string;
  source: EventSource;
  isPaid: boolean;
  title: string;
  description?: string;
  startDate: Date;
  endDate: Date;
  googleCalendarId?: string;
  googleEventId?: string;
  preSessionPlan?: string;
  postSessionNotes?: string;
};

export type EventSnapshot = {
  id: string;
  userId: string;
  customerId: string | null;
  status: EventStatusValue;
  type: EventType;
  isPaymentApplicableYet: boolean;
  price: number;
  paymentMethod: PaymentMethod | null;
  currency: Currency;
  location: string | null;
  source: EventSource;
  isPaid: boolean;
  title: string;
  description: string | null;
  startDate: Date;
  endDate: Date;
  googleCalendarId: string | null;
  googleEventId: string | null;
  preSessionPlan: string | null;
  postSessionNotes: string | null;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
};

export type ChangeEventDetailsProps = {
  title?: string;
  description?: string | null;
  location?: string | null;
};

export type ChangeEventPricingProps = {
  price?: number;
  currency?: string;
  paymentMethod?: string | null;
  isPaymentApplicableYet?: boolean;
};

export type ChangeEventSessionNotesProps = {
  preSessionPlan?: string | null;
  postSessionNotes?: string | null;
};
