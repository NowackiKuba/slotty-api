import { Currency } from '@common/domain/enums';
import { EventSource, EventType } from '@events/domain/enums';
import { EventStatusValue } from '@events/domain/value-objects';
import { PaymentMethod } from '@users/domain/enums';

export type EventReadModel = {
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
};
