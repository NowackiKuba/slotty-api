import {
  CommandBus,
  EventsHandler,
  type IEventHandler,
} from '@common/application/cqrs';
import { EventScheduledEvent } from './event-scheduled.event';
import { ConfirmEventCommand } from '@events/application/commands/confirm-event/confirm-event.command';

@EventsHandler(EventScheduledEvent)
export class EventScheduledListener implements IEventHandler<EventScheduledEvent> {
  constructor(private readonly commandBus: CommandBus) {}

  async handle(event: EventScheduledEvent): Promise<void> {
    const { eventId } = event.payload;

    await this.commandBus.execute(
      new ConfirmEventCommand({ eventId, mode: 'AUTO' }),
    );
  }
}
