import { DomainException } from '@common/exceptions';

export class EventOverlapException extends DomainException {
  readonly code = 'EVENT_OVERLAP';
  readonly statusCode = 409;

  constructor(details: {
    userId: string;
    startDate: Date;
    endDate: Date;
    conflictingEventId?: string;
  }) {
    super('Event overlaps an existing event', details);
  }
}
