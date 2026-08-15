import { EventSnapshot } from '@events/domain/types';

export type EventMarkedAsNoShowEventPayload = {
  event: EventSnapshot;
};

export class EventMarkedAsNoShowEvent {
  constructor(public readonly payload: EventMarkedAsNoShowEventPayload) {}
}
