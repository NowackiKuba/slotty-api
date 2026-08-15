import { Inject } from '@nestjs/common';
import {
  CommandHandler,
  EventBus,
  type ICommandHandler,
} from '@common/application/cqrs';
import { CreateEventCommand } from './create-event.command';
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
import { Event } from '@events/domain/aggregates';
import {
  EventAlreadyExistsException,
  EventOverlapException,
} from '@events/domain/exceptions';
import { USER_PROFILE_REPOSITORY } from '@users/domain/tokens';
import { type IUserProfileRepository } from '@users/domain/repositories';
import { UserProfileNotFoundException } from '@users/domain/exceptions';
import { EventScheduledEvent } from '@events/application/events/event-scheduled/event-scheduled.event';

@CommandHandler(CreateEventCommand)
export class CreateEventHandler implements ICommandHandler<
  CreateEventCommand,
  EventReadModel
> {
  constructor(
    private readonly mapper: EventReadModelMapper,
    @Inject(EVENT_REPOSITORY)
    private readonly eventRepository: IEventRepository,
    @Inject(CUSTOMER_REPOSITORY)
    private readonly customerRepository: ICustomerRepository,
    @Inject(USER_PROFILE_REPOSITORY)
    private readonly userProfileRepository: IUserProfileRepository,
    private readonly eventBus: EventBus,
  ) {}

  async execute(command: CreateEventCommand): Promise<EventReadModel> {
    const {
      userId,
      customerId,
      type,
      price,
      paymentMethod,
      currency,
      location,
      source,
      title,
      description,
      startDate,
      endDate,
      googleCalendarId,
      googleEventId,
      preSessionPlan,
      postSessionNotes,
    } = command.payload;

    if (customerId) {
      const customer = await this.customerRepository.findById(customerId);

      if (!customer) {
        throw new CustomerNotFoundException({ customerId });
      }

      if (customer.userId.value !== userId) {
        throw new CustomerAccessDeniedException({ customerId, userId });
      }
    }

    if (googleEventId) {
      const existingGoogleEvent =
        await this.eventRepository.findByGoogleEventId(userId, googleEventId);

      if (existingGoogleEvent) {
        throw new EventAlreadyExistsException({ userId, googleEventId });
      }
    }

    const overlapping = await this.eventRepository.findOverlapping(
      userId,
      startDate,
      endDate,
    );
    const conflicting = overlapping.find((event) => event.status.isOpen);

    if (conflicting) {
      throw new EventOverlapException({
        userId,
        startDate,
        endDate,
        conflictingEventId: conflicting.id.value,
      });
    }

    const profile = await this.userProfileRepository.findByUserId(userId);

    if (!profile) {
      throw new UserProfileNotFoundException({ userId });
    }

    const event = Event.create({
      userId,
      customerId,
      type,
      price,
      paymentMethod,
      currency,
      location,
      source,
      title,
      description,
      startDate,
      endDate,
      googleCalendarId,
      googleEventId,
      preSessionPlan,
      postSessionNotes,
    });

    await this.eventRepository.save(event);

    if (profile.autoConfirmBookings) {
      await this.eventBus.publish(
        new EventScheduledEvent({ eventId: event.id.value }),
      );
    }

    return this.mapper.toReadModel(event);
  }
}
