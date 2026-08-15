import { DomainException } from '@common/exceptions';

export class InvalidCustomerPackageIdException extends DomainException {
  readonly code = 'INVALID_CUSTOMER_PACKAGE_ID';
  readonly statusCode = 400;

  constructor(customerPackageId: string) {
    super('Invalid customer package id', { customerPackageId });
  }
}
