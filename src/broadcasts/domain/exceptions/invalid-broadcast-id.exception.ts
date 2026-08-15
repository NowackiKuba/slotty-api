import { DomainException } from '@common/exceptions';

export class InvalidBroadcastIdException extends DomainException {
  readonly code = 'INVALID_BROADCAST_ID';
  readonly statusCode = 400;

  constructor(broadcastId: string) {
    super('Invalid broadcast id', { broadcastId });
  }
}
