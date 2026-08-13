import { DomainException } from '@common/exceptions';

export class InvalidCustomerException extends DomainException {
  readonly code = 'INVALID_CUSTOMER';
  readonly statusCode = 400;

  constructor(message: string, details?: Record<string, unknown>) {
    super(message, details);
  }
}
