import { DomainException } from '@common/exceptions';

export class InvalidSessionDurationException extends DomainException {
  readonly code = 'INVALID_SESSION_DURATION';
  readonly statusCode = 400;

  constructor(minutes: number) {
    super('Invalid session duration', { minutes });
  }
}
