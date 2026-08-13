import { DomainException } from '@common/exceptions';

export class InvalidPaymentMethodException extends DomainException {
  readonly code = 'INVALID_PAYMENT_METHOD';
  readonly statusCode = 400;

  constructor(method: string) {
    super('Invalid payment method', { method });
  }
}
