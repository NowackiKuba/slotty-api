import { Inject } from '@nestjs/common';
import { CommandHandler, type ICommandHandler } from '@common/application/cqrs';
import { DeleteEventCommand } from './delete-event.command';
import { getOwnedEvent } from '@events/application/get-owned-event';
import { type IEventRepository } from '@events/domain/repositories';
import { EVENT_REPOSITORY } from '@events/domain/tokens';
import {
  EventAlreadyDeletedException,
  EventNotTerminalException,
} from '@events/domain/exceptions';

@CommandHandler(DeleteEventCommand)
export class DeleteEventHandler implements ICommandHandler<
  DeleteEventCommand,
  string
> {
  constructor(
    @Inject(EVENT_REPOSITORY)
    private readonly eventRepository: IEventRepository,
  ) {}

  async execute(command: DeleteEventCommand): Promise<string> {
    const now = new Date();
    const { eventId, userId } = command.payload;
    const event = await getOwnedEvent(this.eventRepository, eventId, userId, {
      includeDeleted: true,
    });

    if (event.isDeleted) {
      throw new EventAlreadyDeletedException({ eventId, userId });
    }

    if (!event.status.isTerminal) {
      throw new EventNotTerminalException({
        eventId,
        userId,
        status: event.status.value,
      });
    }

    event.softDelete(now);

    await this.eventRepository.save(event);

    return eventId;
  }
}
