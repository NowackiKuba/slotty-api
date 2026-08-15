import { DomainException } from '@common/exceptions';

export class InvalidEventIdException extends DomainException {
  readonly code = 'INVALID_EVENT_ID';
  readonly statusCode = 400;

  constructor(eventId: string) {
    super('Invalid event id', { eventId });
  }
}
