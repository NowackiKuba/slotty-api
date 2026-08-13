import { DomainException } from '@common/exceptions';

export class InvalidUserTimezoneException extends DomainException {
  readonly statusCode = 400;
  readonly code = 'INVALID_USER_TIMEZONE';

  constructor(details: { timezone: string }) {
    super(`invalid IANA timezone: ${details.timezone}`, details);
  }
}
