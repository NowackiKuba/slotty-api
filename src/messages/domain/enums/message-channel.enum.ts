export enum MessageChannel {
  INSTAGRAM = 'INSTAGRAM',
  WHATSAPP = 'WHATSAPP',
  SMS = 'SMS',
}

const MESSAGE_CHANNEL_VALUES = new Set<string>(Object.values(MessageChannel));

export function isMessageChannel(value: string): value is MessageChannel {
  return MESSAGE_CHANNEL_VALUES.has(value);
}
