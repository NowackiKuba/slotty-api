import type { MessageChannel } from '@messages/domain/enums';

export const OUTBOUND_SENDER_PORT = Symbol('OUTBOUND_SENDER_PORT');

export type OutboundSendInput = {
  trainerId: string;
  customerId: string;
  channel: MessageChannel;
  text: string;
};

export type OutboundSendResult = {
  externalMessageId: string;
};

export interface OutboundSenderPort {
  send(input: OutboundSendInput): Promise<OutboundSendResult>;
}
