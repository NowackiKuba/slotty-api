import {
  CommandBus,
  EventsHandler,
  type IEventHandler,
} from '@common/application/cqrs';
import { RecordCustomerNoShowCommand } from '@customers/application/commands/record-customer-no-show/record-customer-no-show.command';
import { EventMarkedAsNoShowEvent } from './event-marked-as-no-show.event';

@EventsHandler(EventMarkedAsNoShowEvent)
export class EventMarkedAsNoShowListener implements IEventHandler<EventMarkedAsNoShowEvent> {
  constructor(private readonly commandBus: CommandBus) {}

  async handle(event: EventMarkedAsNoShowEvent): Promise<void> {
    const { userId, customerId } = event.payload.event;

    if (!customerId) {
      return;
    }

    await this.commandBus.execute(
      new RecordCustomerNoShowCommand({
        userId,
        customerId,
      }),
    );
  }
}
