import { DomainException } from '@common/exceptions';

export class InvalidCustomerStatusException extends DomainException {
  readonly statusCode = 400;
  readonly code = 'INVALID_CUSTOMER_STATUS';

  constructor(status: string) {
    super(`Invalid customer status`, { status });
  }
}
