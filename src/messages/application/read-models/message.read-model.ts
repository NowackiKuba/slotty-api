import { MessageChannel, MessageSender } from '@messages/domain/enums';
import { MessageMetadata } from '@messages/domain/types';

export type MessageReadModel = {
  id: string;
  userId: string;
  customerId: string;
  messageContent: string;
  sender: MessageSender;
  channel: MessageChannel;
  externalMessageId: string;
  metadata: MessageMetadata | null;
  createdAt: Date;
  updatedAt: Date;
};
