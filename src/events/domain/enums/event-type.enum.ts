export enum EventType {
  INDIVIDUAL_SESSION = 'INDIVIDUAL_SESSION', // 1v1 (Tenis, Padel, Personalny)
  GROUP_SESSION = 'GROUP_SESSION', // Grupa / Mecz 2v2
  PERSONAL_BLOCK = 'PERSONAL_BLOCK', // Prywatna blokada trenera (np. dentysta)
}

const EVENT_TYPE_VALUES = new Set<string>(Object.values(EventType));

export function isEventType(value: string): value is EventType {
  return EVENT_TYPE_VALUES.has(value);
}

export function isSessionEventType(value: EventType): boolean {
  return (
    value === EventType.INDIVIDUAL_SESSION || value === EventType.GROUP_SESSION
  );
}
