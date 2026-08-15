import { DomainException } from '@common/exceptions';

export class CustomerPackageAccessDeniedException extends DomainException {
  readonly code = 'CUSTOMER_PACKAGE_ACCESS_DENIED';
  readonly statusCode = 403;

  constructor(details: { customerPackageId?: string; userId?: string }) {
    super('Customer package access denied', details);
  }
}
