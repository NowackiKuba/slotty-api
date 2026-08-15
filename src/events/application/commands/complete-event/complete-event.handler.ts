import { Inject } from '@nestjs/common';
import {
  CommandHandler,
  EventBus,
  type ICommandHandler,
} from '@common/application/cqrs';
import { CompleteEventCommand } from './complete-event.command';
import { EventCompletedEvent } from '@events/application/events/event-completed/event-completed.event';
import { getOwnedEvent } from '@events/application/get-owned-event';
import { EventReadModelMapper } from '@events/application/mappers';
import { EventReadModel } from '@events/application/read-models';
import { type IEventRepository } from '@events/domain/repositories';
import { EVENT_REPOSITORY } from '@events/domain/tokens';

@CommandHandler(CompleteEventCommand)
export class CompleteEventHandler implements ICommandHandler<
  CompleteEventCommand,
  EventReadModel
> {
  constructor(
    private readonly mapper: EventReadModelMapper,
    @Inject(EVENT_REPOSITORY)
    private readonly eventRepository: IEventRepository,
    private readonly eventBus: EventBus,
  ) {}

  async execute(command: CompleteEventCommand): Promise<EventReadModel> {
    const { eventId, userId } = command.payload;
    const event = await getOwnedEvent(this.eventRepository, eventId, userId);

    event.complete();

    await this.eventRepository.save(event);
    await this.eventBus.publish(
      new EventCompletedEvent({ event: event.toSnapshot() }),
    );

    return this.mapper.toReadModel(event);
  }
}
