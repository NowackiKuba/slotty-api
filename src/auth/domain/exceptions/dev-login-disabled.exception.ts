import { DomainException } from '@common/exceptions';

export class DevLoginDisabledException extends DomainException {
  readonly code = 'DEV_LOGIN_DISABLED';
  readonly statusCode = 404;

  constructor() {
    super('Not Found');
  }
}
