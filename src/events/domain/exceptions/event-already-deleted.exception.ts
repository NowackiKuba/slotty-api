import { DomainException } from '@common/exceptions';

export class EventAlreadyDeletedException extends DomainException {
  readonly code = 'EVENT_ALREADY_DELETED';
  readonly statusCode = 409;

  constructor(details: { eventId?: string; userId?: string }) {
    super('Event is already deleted', details);
  }
}
