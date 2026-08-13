import { DomainException } from '@common/exceptions';

export class InvalidPaymentDetailsException extends DomainException {
  readonly code = 'INVALID_PAYMENT_DETAILS';
  readonly statusCode = 400;

  constructor(reason: string) {
    super(`Invalid payment details: ${reason}`, { reason });
  }
}
