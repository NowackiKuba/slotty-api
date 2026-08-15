import { DomainException } from '@common/exceptions';

export class InvalidBroadcastStatusException extends DomainException {
  readonly code = 'INVALID_BROADCAST_STATUS';
  readonly statusCode = 400;

  constructor(status: string) {
    super('Invalid broadcast status', { status });
  }
}
