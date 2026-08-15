import { Event } from '@events/domain/aggregates';
import {
  EventAccessDeniedException,
  EventNotFoundException,
} from '@events/domain/exceptions';
import type { IEventRepository } from '@events/domain/repositories';
import { EventId } from '@events/domain/value-objects';

export async function getOwnedEvent(
  eventRepository: IEventRepository,
  eventId: string,
  userId: string,
  options?: { includeDeleted?: boolean },
): Promise<Event> {
  EventId.create(eventId);

  const event = options?.includeDeleted
    ? await eventRepository.findByIdIncludingDeleted(eventId)
    : await eventRepository.findById(eventId);

  if (!event) {
    throw new EventNotFoundException({ eventId, userId });
  }

  if (event.userId.value !== userId) {
    throw new EventAccessDeniedException({ eventId, userId });
  }

  return event;
}
