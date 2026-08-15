import { Inject } from '@nestjs/common';
import {
  CommandHandler,
  EventBus,
  type ICommandHandler,
} from '@common/application/cqrs';
import { RecordNoShowCommand } from './record-no-show.command';
import { EventMarkedAsNoShowEvent } from '@events/application/events/event-marked-as-no-show/event-marked-as-no-show.event';
import { getOwnedEvent } from '@events/application/get-owned-event';
import { EventReadModelMapper } from '@events/application/mappers';
import { EventReadModel } from '@events/application/read-models';
import { type IEventRepository } from '@events/domain/repositories';
import { EVENT_REPOSITORY } from '@events/domain/tokens';

@CommandHandler(RecordNoShowCommand)
export class RecordNoShowHandler implements ICommandHandler<
  RecordNoShowCommand,
  EventReadModel
> {
  constructor(
    private readonly mapper: EventReadModelMapper,
    @Inject(EVENT_REPOSITORY)
    private readonly eventRepository: IEventRepository,
    private readonly eventBus: EventBus,
  ) {}

  async execute(command: RecordNoShowCommand): Promise<EventReadModel> {
    const { eventId, userId } = command.payload;
    const event = await getOwnedEvent(this.eventRepository, eventId, userId);

    event.markNoShow();

    await this.eventRepository.save(event);
    await this.eventBus.publish(
      new EventMarkedAsNoShowEvent({ event: event.toSnapshot() }),
    );

    return this.mapper.toReadModel(event);
  }
}
