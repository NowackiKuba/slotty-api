import { DomainException } from '@common/exceptions';

export class InvalidBroadcastRecipientException extends DomainException {
  readonly code = 'INVALID_BROADCAST_RECIPIENT';
  readonly statusCode = 400;

  constructor(message: string, details?: Record<string, unknown>) {
    super(message, details);
  }
}
