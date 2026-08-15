export type EventScheduledEventPayload = {
  eventId: string;
};

export class EventScheduledEvent {
  constructor(public readonly payload: EventScheduledEventPayload) {}
}
