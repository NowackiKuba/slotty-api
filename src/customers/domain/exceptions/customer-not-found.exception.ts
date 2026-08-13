import { DomainException } from '@common/exceptions';

export class CustomerNotFoundException extends DomainException {
  readonly code = 'CUSTOMER_NOT_FOUND';
  readonly statusCode = 404;

  constructor(details: { customerId?: string; userId?: string }) {
    super('Customer not found', details);
  }
}
