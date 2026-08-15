import { Command } from '@common/application/cqrs';
import { Currency } from '@common/domain/enums';
import { EventType } from '@events/domain/enums';
import { PaymentMethod } from '@users/domain/enums';

export type UpdateEventCommandPayload = {
  userId: string;
  eventId: string;
  customerId?: string | null;
  type?: EventType;
  price?: number;
  paymentMethod?: PaymentMethod | null;
  currency?: Currency;
  location?: string | null;
  title?: string;
  description?: string | null;
  startDate?: Date;
  endDate?: Date;
  googleCalendarId?: string | null;
  googleEventId?: string | null;
  preSessionPlan?: string | null;
  postSessionNotes?: string | null;
  isPaymentApplicableYet?: boolean;
  isPaid?: boolean;
};

export class UpdateEventCommand extends Command<UpdateEventCommandPayload> {
  constructor(payload: UpdateEventCommandPayload) {
    super(payload);
  }
}
