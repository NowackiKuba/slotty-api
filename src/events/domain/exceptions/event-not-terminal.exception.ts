import { DomainException } from '@common/exceptions';

export class EventNotTerminalException extends DomainException {
  readonly code = 'EVENT_NOT_TERMINAL';
  readonly statusCode = 409;

  constructor(details: { eventId?: string; userId?: string; status?: string }) {
    super(
      'Only completed, cancelled or no-show events can be deleted',
      details,
    );
  }
}
