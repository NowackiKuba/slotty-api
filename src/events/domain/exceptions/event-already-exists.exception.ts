import { DomainException } from '@common/exceptions';

export class EventAlreadyExistsException extends DomainException {
  readonly code = 'EVENT_ALREADY_EXISTS';
  readonly statusCode = 409;

  constructor(details: { userId: string; googleEventId: string }) {
    super('Event already exists', details);
  }
}
