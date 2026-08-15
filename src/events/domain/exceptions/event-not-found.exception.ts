import { DomainException } from '@common/exceptions';

export class EventNotFoundException extends DomainException {
  readonly code = 'EVENT_NOT_FOUND';
  readonly statusCode = 404;

  constructor(details: { eventId?: string; userId?: string }) {
    super('Event not found', details);
  }
}
