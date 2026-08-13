import { DomainException } from '@common/exceptions';

export class InvalidSportException extends DomainException {
  readonly code = 'INVALID_SPORT';
  readonly statusCode = 400;

  constructor(sport: string) {
    super('Invalid sport', { sport });
  }
}
