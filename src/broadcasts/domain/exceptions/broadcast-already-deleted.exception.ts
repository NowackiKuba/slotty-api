import { DomainException } from '@common/exceptions';

export class BroadcastAlreadyDeletedException extends DomainException {
  readonly code = 'BROADCAST_ALREADY_DELETED';
  readonly statusCode = 409;

  constructor(details: { broadcastId?: string; userId?: string }) {
    super('Broadcast is already deleted', details);
  }
}
