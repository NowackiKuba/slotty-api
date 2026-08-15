import { DomainException } from '@common/exceptions';

export class InvalidDayOfWeekException extends DomainException {
  readonly code = 'INVALID_DAY_OF_WEEK';
  readonly statusCode = 400;

  constructor(dayOfWeek: number | string) {
    super('Day of week must be between 1 (Monday) and 7 (Sunday)', {
      dayOfWeek,
    });
  }
}
