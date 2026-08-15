import { DomainException } from '@common/exceptions';

export class InvalidEventSourceException extends DomainException {
  readonly code = 'INVALID_EVENT_SOURCE';
  readonly statusCode = 400;

  constructor(source: string) {
    super('Invalid event source', { source });
  }
}
