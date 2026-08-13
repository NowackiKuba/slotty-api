import { DomainException } from '@common/exceptions';

export class InvalidCustomerSourceException extends DomainException {
  readonly code = 'INVALID_CUSTOMER_SOURCE';
  readonly statusCode = 400;

  constructor(source: string) {
    super('Invalid customer source', { source });
  }
}
