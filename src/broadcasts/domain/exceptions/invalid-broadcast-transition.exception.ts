import { DomainException } from '@common/exceptions';

export class InvalidBroadcastTransitionException extends DomainException {
  readonly code = 'INVALID_BROADCAST_TRANSITION';
  readonly statusCode = 409;

  constructor(from: string, to: string) {
    super('Invalid broadcast status transition', { from, to });
  }
}
