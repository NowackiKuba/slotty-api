import { DomainException } from '@common/exceptions';

export class InvalidBroadcastRecipientIdException extends DomainException {
  readonly code = 'INVALID_BROADCAST_RECIPIENT_ID';
  readonly statusCode = 400;

  constructor(recipientId: string) {
    super('Invalid broadcast recipient id', { recipientId });
  }
}
