import { DomainException } from '@common/exceptions';

export class MessageAlreadyDeletedException extends DomainException {
  readonly code = 'MESSAGE_ALREADY_DELETED';
  readonly statusCode = 409;

  constructor(details: { messageId?: string; userId?: string }) {
    super('Message is already deleted', details);
  }
}
