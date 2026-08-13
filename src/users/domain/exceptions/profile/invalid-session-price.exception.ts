import { DomainException } from '@common/exceptions';

export class InvalidSessionPriceException extends DomainException {
  readonly code = 'INVALID_SESSION_PRICE';
  readonly statusCode = 400;

  constructor(details: { amount: number; currency?: string }) {
    super('Invalid session price', details);
  }
}
