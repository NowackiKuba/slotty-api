export enum BroadcastRecipientStatusEnum {
  PENDING = 'PENDING',
  PROCESSING = 'PROCESSING',
  SENT = 'SENT',
  DELIVERED = 'DELIVERED',
  FAILED = 'FAILED',
}

const BROADCAST_RECIPIENT_STATUS_VALUES = new Set<string>(
  Object.values(BroadcastRecipientStatusEnum),
);

export function isBroadcastRecipientStatus(
  value: string,
): value is BroadcastRecipientStatusEnum {
  return BROADCAST_RECIPIENT_STATUS_VALUES.has(value);
}
