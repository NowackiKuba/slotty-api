export enum BroadcastStatusEnum {
  DRAFT = 'DRAFT',
  SENDING = 'SENDING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
}

const BROADCAST_STATUS_VALUES = new Set<string>(
  Object.values(BroadcastStatusEnum),
);

export function isBroadcastStatus(value: string): value is BroadcastStatusEnum {
  return BROADCAST_STATUS_VALUES.has(value);
}
