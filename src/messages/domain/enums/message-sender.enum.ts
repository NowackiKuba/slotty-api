export enum MessageSender {
  CUSTOMER = 'CUSTOMER',
  AI_BOT = 'AI_BOT',
  TRAINER = 'TRAINER',
}

const MESSAGE_SENDER_VALUES = new Set<string>(Object.values(MessageSender));

export function isMessageSender(value: string): value is MessageSender {
  return MESSAGE_SENDER_VALUES.has(value);
}
