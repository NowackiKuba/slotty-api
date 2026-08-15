import { DomainException } from '@common/exceptions';

export class InvalidEventStatusException extends DomainException {
  readonly code = 'INVALID_EVENT_STATUS';
  readonly statusCode = 400;

  constructor(status: string) {
    super('Invalid event status', { status });
  }
}
