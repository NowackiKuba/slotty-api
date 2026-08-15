import { DomainException } from '@common/exceptions';

export class InvalidEventTypeException extends DomainException {
  readonly code = 'INVALID_EVENT_TYPE';
  readonly statusCode = 400;

  constructor(type: string) {
    super('Invalid event type', { type });
  }
}
