import { DomainException } from '@common/exceptions';

export class CustomerPackageNotFoundException extends DomainException {
  readonly code = 'CUSTOMER_PACKAGE_NOT_FOUND';
  readonly statusCode = 404;

  constructor(details: { customerPackageId?: string; userId?: string }) {
    super('Customer package not found', details);
  }
}
