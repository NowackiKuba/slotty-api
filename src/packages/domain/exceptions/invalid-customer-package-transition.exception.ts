import { DomainException } from '@common/exceptions';

export class InvalidCustomerPackageTransitionException extends DomainException {
  readonly code = 'INVALID_CUSTOMER_PACKAGE_TRANSITION';
  readonly statusCode = 409;

  constructor(from: string, to: string) {
    super('Invalid customer package status transition', { from, to });
  }
}
