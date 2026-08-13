import { DomainException } from '@common/exceptions';

export class InvalidCustomerIdException extends DomainException {
  readonly code = 'INVALID_CUSTOMER_ID';
  readonly statusCode = 400;

  constructor(customerId: string) {
    super('Invalid customer id', { customerId });
  }
}
