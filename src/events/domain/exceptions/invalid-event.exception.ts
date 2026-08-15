import { DomainException } from '@common/exceptions';

export class InvalidEventException extends DomainException {
  readonly code = 'INVALID_EVENT';
  readonly statusCode = 400;

  constructor(message: string, details?: Record<string, unknown>) {
    super(message, details);
  }
}
