import {
  CommandBus,
  EventsHandler,
  type IEventHandler,
} from '@common/application/cqrs';
import { RecordCustomerSessionCommand } from '@customers/application/commands/record-customer-session/record-customer-session.command';
import { EventCompletedEvent } from './event-completed.event';

@EventsHandler(EventCompletedEvent)
export class EventCompletedListener implements IEventHandler<EventCompletedEvent> {
  constructor(private readonly commandBus: CommandBus) {}

  async handle(event: EventCompletedEvent): Promise<void> {
    const { userId, customerId } = event.payload.event;

    if (!customerId) {
      return;
    }

    await this.commandBus.execute(
      new RecordCustomerSessionCommand({
        userId,
        customerId,
      }),
    );
  }
}
