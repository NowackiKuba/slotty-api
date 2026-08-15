import { DomainException } from '@common/exceptions';

export class MessageAlreadyExistsException extends DomainException {
  readonly code = 'MESSAGE_ALREADY_EXISTS';
  readonly statusCode = 409;

  constructor(details: {
    userId: string;
    channel: string;
    externalMessageId: string;
  }) {
    super('Message already exists', details);
  }
}
