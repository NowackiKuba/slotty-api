import type { EventSnapshot } from '@events/domain/types';

export type EventCompletedEventPayload = {
  event: EventSnapshot;
};

export class EventCompletedEvent {
  constructor(public readonly payload: EventCompletedEventPayload) {}
}
