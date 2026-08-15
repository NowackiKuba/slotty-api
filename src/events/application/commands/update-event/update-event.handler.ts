import { Inject } from '@nestjs/common';
import { CommandHandler, type ICommandHandler } from '@common/application/cqrs';
import { UpdateEventCommand } from './update-event.command';
import { EventReadModel } from '@events/application/read-models';
import { EventReadModelMapper } from '@events/application/mappers';
import { EVENT_REPOSITORY } from '@events/domain/tokens';
import { type IEventRepository } from '@events/domain/repositories';
import { CUSTOMER_REPOSITORY } from '@customers/domain/tokens';
import { type ICustomerRepository } from '@customers/domain/repositories';
import {
  CustomerAccessDeniedException,
  CustomerNotFoundException,
} from '@customers/domain/exceptions';
import { getOwnedEvent } from '@events/application/get-owned-event';
import {
  EventAlreadyExistsException,
  EventOverlapException,
} from '@events/domain/exceptions';

@CommandHandler(UpdateEventCommand)
export class UpdateEventHandler implements ICommandHandler<
  UpdateEventCommand,
  EventReadModel
> {
  constructor(
    private readonly mapper: EventReadModelMapper,
    @Inject(EVENT_REPOSITORY)
    private readonly eventRepository: IEventRepository,
    @Inject(CUSTOMER_REPOSITORY)
    private readonly customerRepository: ICustomerRepository,
  ) {}

  async execute(command: UpdateEventCommand): Promise<EventReadModel> {
    const {
      userId,
      eventId,
      customerId,
      type,
      price,
      paymentMethod,
      currency,
      location,
      title,
      description,
      startDate,
      endDate,
      googleCalendarId,
      googleEventId,
      preSessionPlan,
      postSessionNotes,
      isPaymentApplicableYet,
      isPaid,
    } = command.payload;

    const event = await getOwnedEvent(this.eventRepository, eventId, userId);

    if (customerId) {
      const customer = await this.customerRepository.findById(customerId);

      if (!customer) {
        throw new CustomerNotFoundException({ customerId });
      }

      if (customer.userId.value !== userId) {
        throw new CustomerAccessDeniedException({ customerId, userId });
      }
    }

    if (googleEventId && googleEventId !== event.googleEventId) {
      const existingGoogleEvent =
        await this.eventRepository.findByGoogleEventId(userId, googleEventId);

      if (existingGoogleEvent) {
        throw new EventAlreadyExistsException({ userId, googleEventId });
      }
    }

    const nextStartDate = startDate ?? event.startDate;
    const nextEndDate = endDate ?? event.endDate;
    const datesChanged = startDate !== undefined || endDate !== undefined;

    if (datesChanged) {
      const overlapping = await this.eventRepository.findOverlapping(
        userId,
        nextStartDate,
        nextEndDate,
        eventId,
      );
      const conflicting = overlapping.find((item) => item.status.isOpen);

      if (conflicting) {
        throw new EventOverlapException({
          userId,
          startDate: nextStartDate,
          endDate: nextEndDate,
          conflictingEventId: conflicting.id.value,
        });
      }

      event.reschedule(nextStartDate, nextEndDate);
    }

    if (
      title !== undefined ||
      description !== undefined ||
      location !== undefined
    ) {
      event.changeDetails({ title, description, location });
    }

    if (type !== undefined) {
      event.changeType(type);
    }

    if (customerId === null) {
      event.unassignCustomer();
    } else if (customerId !== undefined) {
      event.assignCustomer(customerId);
    }

    if (
      price !== undefined ||
      currency !== undefined ||
      paymentMethod !== undefined ||
      isPaymentApplicableYet !== undefined
    ) {
      event.changePricing({
        price,
        currency,
        paymentMethod,
        isPaymentApplicableYet,
      });
    }

    if (isPaid === true) {
      event.markPaid();
    } else if (isPaid === false) {
      event.markUnpaid();
    }

    if (preSessionPlan !== undefined || postSessionNotes !== undefined) {
      event.changeSessionNotes({ preSessionPlan, postSessionNotes });
    }

    if (googleCalendarId === null || googleEventId === null) {
      event.unlinkGoogleCalendar();
    } else if (googleCalendarId !== undefined && googleEventId !== undefined) {
      event.linkGoogleCalendar(googleCalendarId, googleEventId);
    }

    await this.eventRepository.save(event);

    return this.mapper.toReadModel(event);
  }
}
