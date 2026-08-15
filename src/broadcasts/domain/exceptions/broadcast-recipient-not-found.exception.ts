import { DomainException } from '@common/exceptions';

export class BroadcastRecipientNotFoundException extends DomainException {
  readonly code = 'BROADCAST_RECIPIENT_NOT_FOUND';
  readonly statusCode = 404;

  constructor(details: {
    broadcastId?: string;
    customerId?: string;
    recipientId?: string;
  }) {
    super('Broadcast recipient not found', details);
  }
}
