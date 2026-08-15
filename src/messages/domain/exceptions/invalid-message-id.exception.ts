import { DomainException } from '@common/exceptions';

export class InvalidMessageIdException extends DomainException {
  readonly code = 'INVALID_MESSAGE_ID';
  readonly statusCode = 400;

  constructor(messageId: string) {
    super('Invalid message id', { messageId });
  }
}
