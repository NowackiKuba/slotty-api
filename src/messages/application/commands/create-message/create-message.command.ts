import { Command } from '@common/application/cqrs';
import { MessageChannel, MessageSender } from '@messages/domain/enums';
import type { MessageMetadata } from '@messages/domain/types';

export type CreateMessageCommandPayload = {
  id?: string;
  userId: string;
  customerId: string;
  messageContent: string;
  sender: MessageSender;
  channel: MessageChannel;
  externalMessageId: string;
  metadata?: MessageMetadata;
};

export class CreateMessageCommand extends Command<CreateMessageCommandPayload> {
  constructor(payload: CreateMessageCommandPayload) {
    super(payload);
  }
}
