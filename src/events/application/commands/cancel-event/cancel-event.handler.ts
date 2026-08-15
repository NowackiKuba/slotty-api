import { Inject } from '@nestjs/common';
import { CommandHandler, type ICommandHandler } from '@common/application/cqrs';
import { CancelEventCommand } from './cancel-event.command';
import { getOwnedEvent } from '@events/application/get-owned-event';
import { EventReadModelMapper } from '@events/application/mappers';
import { EventReadModel } from '@events/application/read-models';
import { type IEventRepository } from '@events/domain/repositories';
import { EVENT_REPOSITORY } from '@events/domain/tokens';

@CommandHandler(CancelEventCommand)
export class CancelEventHandler implements ICommandHandler<
  CancelEventCommand,
  EventReadModel
> {
  constructor(
    private readonly mapper: EventReadModelMapper,
    @Inject(EVENT_REPOSITORY)
    private readonly eventRepository: IEventRepository,
  ) {}

  async execute(command: CancelEventCommand): Promise<EventReadModel> {
    const { eventId, userId, byWho } = command.payload;
    const event = await getOwnedEvent(this.eventRepository, eventId, userId);

    if (byWho === 'TRAINER') {
      event.cancelByTrainer();
    } else {
      event.cancelByCustomer();
    }

    await this.eventRepository.save(event);

    return this.mapper.toReadModel(event);
  }
}
