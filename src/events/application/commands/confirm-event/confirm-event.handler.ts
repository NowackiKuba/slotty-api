import { Inject, UnauthorizedException } from '@nestjs/common';
import { CommandHandler, type ICommandHandler } from '@common/application/cqrs';
import { ConfirmEventCommand } from './confirm-event.command';
import { EventReadModel } from '@events/application/read-models';
import { EventReadModelMapper } from '@events/application/mappers';
import { EVENT_REPOSITORY } from '@events/domain/tokens';
import { type IEventRepository } from '@events/domain/repositories';
import { USER_PROFILE_REPOSITORY } from '@users/domain/tokens';
import { type IUserProfileRepository } from '@users/domain/repositories';
import {
  EventAccessDeniedException,
  EventAutoConfirmDisabledException,
  EventNotFoundException,
} from '@events/domain/exceptions';
import { UserProfileNotFoundException } from '@users/domain/exceptions';

@CommandHandler(ConfirmEventCommand)
export class ConfirmEventHandler implements ICommandHandler<
  ConfirmEventCommand,
  EventReadModel
> {
  constructor(
    private readonly mapper: EventReadModelMapper,
    @Inject(EVENT_REPOSITORY)
    private readonly eventRepository: IEventRepository,
    @Inject(USER_PROFILE_REPOSITORY)
    private readonly userProfileRepository: IUserProfileRepository,
  ) {}

  async execute(command: ConfirmEventCommand): Promise<EventReadModel> {
    const { eventId, userId, mode } = command.payload;

    const event = await this.eventRepository.findById(eventId);

    if (!event) {
      throw new EventNotFoundException({ eventId });
    }

    if (mode === 'MANUAL') {
      if (!userId) {
        throw new UnauthorizedException();
      }

      if (event.userId.value !== userId) {
        throw new EventAccessDeniedException({ userId, eventId });
      }
    }

    const ownerId = event.userId.value;
    const profile = await this.userProfileRepository.findByUserId(ownerId);

    if (!profile) {
      throw new UserProfileNotFoundException({ userId: ownerId });
    }

    if (mode === 'AUTO' && !profile.autoConfirmBookings) {
      throw new EventAutoConfirmDisabledException({
        eventId,
        userId: ownerId,
      });
    }

    event.confirm();

    await this.eventRepository.save(event);

    return this.mapper.toReadModel(event);
  }
}
