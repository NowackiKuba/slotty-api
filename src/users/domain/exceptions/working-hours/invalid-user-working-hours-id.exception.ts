import { DomainException } from '@common/exceptions';

export class InvalidUserWorkingHoursIdException extends DomainException {
  readonly code = 'INVALID_USER_WORKING_HOURS_ID';
  readonly statusCode = 400;

  constructor(workingHoursId: string) {
    super('Invalid user working hours id', { workingHoursId });
  }
}
