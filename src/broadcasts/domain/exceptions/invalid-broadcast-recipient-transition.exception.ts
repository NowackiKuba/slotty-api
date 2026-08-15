import { DomainException } from '@common/exceptions';

export class InvalidBroadcastRecipientTransitionException extends DomainException {
  readonly code = 'INVALID_BROADCAST_RECIPIENT_TRANSITION';
  readonly statusCode = 409;

  constructor(from: string, to: string) {
    super('Invalid broadcast recipient status transition', { from, to });
  }
}
