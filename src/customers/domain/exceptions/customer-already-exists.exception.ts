import { DomainException } from '@common/exceptions';

export type CustomerAlreadyExistsField =
  'email' | 'phoneNumber' | 'instagramAccountId' | 'whatsappAccountId';

export class CustomerAlreadyExistsException extends DomainException {
  readonly code = 'CUSTOMER_ALREADY_EXISTS';
  readonly statusCode = 409;

  constructor(details: {
    userId: string;
    field: CustomerAlreadyExistsField;
    email?: string;
    phoneNumber?: string;
    instagramAccountId?: string;
    whatsappAccountId?: string;
  }) {
    super('Customer already exists', details);
  }
}
