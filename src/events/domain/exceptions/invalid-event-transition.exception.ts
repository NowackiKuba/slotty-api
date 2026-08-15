import { DomainException } from '@common/exceptions';

export class InvalidEventTransitionException extends DomainException {
  readonly code = 'INVALID_EVENT_TRANSITION';
  readonly statusCode = 409;

  constructor(from: string, to: string) {
    super('Invalid event status transition', { from, to });
  }
}
