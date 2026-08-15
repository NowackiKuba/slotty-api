import { DomainException } from '@common/exceptions';

export class InvalidMessageException extends DomainException {
  readonly code = 'INVALID_MESSAGE';
  readonly statusCode = 400;

  constructor(message: string, details?: Record<string, unknown>) {
    super(message, details);
  }
}
