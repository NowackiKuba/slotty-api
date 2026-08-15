import { Command } from '@common/application/cqrs';
import { Currency } from '@common/domain/enums';
import { EventSource, EventType } from '@events/domain/enums';
import { PaymentMethod } from '@users/domain/enums';

export type CreateEventCommandPayload = {
  userId: string;
  customerId?: string;
  type: EventType;
  price: number;
  paymentMethod?: PaymentMethod;
  currency: Currency;
  location?: string;
  source: EventSource;
  title: string;
  description?: string;
  startDate: Date;
  endDate: Date;
  googleCalendarId?: string;
  googleEventId?: string;
  preSessionPlan?: string;
  postSessionNotes?: string;
};

export class CreateEventCommand extends Command<CreateEventCommandPayload> {
  constructor(payload: CreateEventCommandPayload) {
    super(payload);
  }
}
