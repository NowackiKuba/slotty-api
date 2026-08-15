import { DomainException } from '@common/exceptions';

export class EventAutoConfirmDisabledException extends DomainException {
  readonly code = 'EVENT_AUTO_CONFIRM_DISABLED';
  readonly statusCode = 403;

  constructor(details: { eventId?: string; userId?: string }) {
    super('Auto confirm bookings is disabled', details);
  }
}
