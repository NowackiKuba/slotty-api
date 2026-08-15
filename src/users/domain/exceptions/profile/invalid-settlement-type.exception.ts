import { DomainException } from '@common/exceptions';

export class InvalidSettlementTypeException extends DomainException {
  readonly code = 'INVALID_SETTLEMENT_TYPE';
  readonly statusCode = 400;

  constructor(type: string) {
    super('Invalid settlement type', { type });
  }
}
