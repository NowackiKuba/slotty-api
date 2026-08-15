import { DomainException } from '@common/exceptions';

export class InvalidCustomerPackageException extends DomainException {
  readonly code = 'INVALID_CUSTOMER_PACKAGE';
  readonly statusCode = 400;

  constructor(message: string, details?: Record<string, unknown>) {
    super(message, details);
  }
}
