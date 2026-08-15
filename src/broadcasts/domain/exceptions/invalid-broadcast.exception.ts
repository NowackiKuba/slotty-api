import { DomainException } from '@common/exceptions';

export class InvalidBroadcastException extends DomainException {
  readonly code = 'INVALID_BROADCAST';
  readonly statusCode = 400;

  constructor(message: string, details?: Record<string, unknown>) {
    super(message, details);
  }
}
