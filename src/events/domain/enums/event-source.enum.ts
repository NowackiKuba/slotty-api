export enum EventSource {
  AI_BOT = 'AI_BOT',
  TRAINER_MANUAL = 'TRAINER_MANUAL',
  GOOGLE_SYNC = 'GOOGLE_SYNC',
}

const EVENT_SOURCE_VALUES = new Set<string>(Object.values(EventSource));

export function isEventSource(value: string): value is EventSource {
  return EVENT_SOURCE_VALUES.has(value);
}
