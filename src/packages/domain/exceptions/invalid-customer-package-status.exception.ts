import { DomainException } from '@common/exceptions';

export class InvalidCustomerPackageStatusException extends DomainException {
  readonly code = 'INVALID_CUSTOMER_PACKAGE_STATUS';
  readonly statusCode = 400;

  constructor(status: string) {
    super('Invalid customer package status', { status });
  }
}
