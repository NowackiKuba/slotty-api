import { DomainException } from '@common/exceptions';

export class InvalidRefreshTokenException extends DomainException {
  readonly code = 'INVALID_REFRESH_TOKEN';
  readonly statusCode = 401;

  constructor() {
    super('Invalid or expired refresh token');
  }
}
