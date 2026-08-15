import { DomainException } from '@common/exceptions';

export class EventAccessDeniedException extends DomainException {
  readonly code = 'EVENT_ACCESS_DENIED';
  readonly statusCode = 403;

  constructor(details: { eventId?: string; userId?: string }) {
    super('Event access denied', details);
  }
}
