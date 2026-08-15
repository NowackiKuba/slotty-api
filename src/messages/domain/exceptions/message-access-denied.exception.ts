import { DomainException } from '@common/exceptions';

export class MessageAccessDeniedException extends DomainException {
  readonly code = 'MESSAGE_ACCESS_DENIED';
  readonly statusCode = 403;

  constructor(details: { messageId?: string; userId?: string }) {
    super('Message access denied', details);
  }
}
