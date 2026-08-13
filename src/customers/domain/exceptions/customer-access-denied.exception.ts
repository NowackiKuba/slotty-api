import { DomainException } from '@common/exceptions';

export class CustomerAccessDeniedException extends DomainException {
  readonly code = 'CUSTOMER_ACCESS_DENIED';
  readonly statusCode = 403;

  constructor(details: { customerId?: string; userId?: string }) {
    super('Customer access denied', details);
  }
}
