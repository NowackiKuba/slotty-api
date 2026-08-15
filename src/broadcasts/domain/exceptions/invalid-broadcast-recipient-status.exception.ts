import { DomainException } from '@common/exceptions';

export class InvalidBroadcastRecipientStatusException extends DomainException {
  readonly code = 'INVALID_BROADCAST_RECIPIENT_STATUS';
  readonly statusCode = 400;

  constructor(status: string) {
    super('Invalid broadcast recipient status', { status });
  }
}
