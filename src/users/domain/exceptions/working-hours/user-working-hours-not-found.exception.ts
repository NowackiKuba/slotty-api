import { DomainException } from '@common/exceptions';

export class UserWorkingHoursNotFoundException extends DomainException {
  readonly code = 'USER_WORKING_HOURS_NOT_FOUND';
  readonly statusCode = 404;

  constructor(details: { userId?: string; dayOfWeek?: number }) {
    super('User working hours not found', details);
  }
}
