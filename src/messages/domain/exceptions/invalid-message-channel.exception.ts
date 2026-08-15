import { DomainException } from '@common/exceptions';

export class InvalidMessageChannelException extends DomainException {
  readonly code = 'INVALID_MESSAGE_CHANNEL';
  readonly statusCode = 400;

  constructor(channel: string) {
    super('Invalid message channel', { channel });
  }
}
