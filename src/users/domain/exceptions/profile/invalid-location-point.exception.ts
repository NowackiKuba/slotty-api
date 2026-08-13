import { DomainException } from '@common/exceptions';

export class InvalidLocationPointException extends DomainException {
  readonly code = 'INVALID_LOCATION_POINT';
  readonly statusCode = 400;

  constructor(details: { lat?: number; lng?: number; reason: string }) {
    super(`Invalid location point: ${details.reason}`, details);
  }
}
