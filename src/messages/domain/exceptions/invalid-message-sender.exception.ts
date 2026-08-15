import { DomainException } from '@common/exceptions';

export class InvalidMessageSenderException extends DomainException {
  readonly code = 'INVALID_MESSAGE_SENDER';
  readonly statusCode = 400;

  constructor(sender: string) {
    super('Invalid message sender', { sender });
  }
}
