import { DomainException } from '@common/exceptions';

export class MessageNotFoundException extends DomainException {
  readonly code = 'MESSAGE_NOT_FOUND';
  readonly statusCode = 404;

  constructor(details: { messageId?: string; userId?: string }) {
    super('Message not found', details);
  }
}
