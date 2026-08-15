import { DomainException } from '@common/exceptions';

export class BroadcastNotFoundException extends DomainException {
  readonly code = 'BROADCAST_NOT_FOUND';
  readonly statusCode = 404;

  constructor(details: { broadcastId?: string; userId?: string }) {
    super('Broadcast not found', details);
  }
}
