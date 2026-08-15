import { DomainException } from '@common/exceptions';

export class BroadcastAccessDeniedException extends DomainException {
  readonly code = 'BROADCAST_ACCESS_DENIED';
  readonly statusCode = 403;

  constructor(details: { broadcastId?: string; userId?: string }) {
    super('Broadcast access denied', details);
  }
}
