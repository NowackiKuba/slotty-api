import { DomainException } from '@common/exceptions';

export class CustomerPackageAlreadyDeletedException extends DomainException {
  readonly code = 'CUSTOMER_PACKAGE_ALREADY_DELETED';
  readonly statusCode = 409;

  constructor(details: { customerPackageId?: string; userId?: string }) {
    super('Customer package is already deleted', details);
  }
}
