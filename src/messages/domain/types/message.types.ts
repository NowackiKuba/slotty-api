import type { MessageChannel, MessageSender } from '@messages/domain/enums';

export type MessageToolResult = 'SUCCESS' | 'FAILED';

export type MetadataExecutedTool = {
  toolName: string;
  args: Record<string, unknown>;
  result: MessageToolResult;
};

export type MessageMetadata = {
  executedTools?: MetadataExecutedTool[];
};

export type CreateMessageProps = {
  id?: string;
  userId: string;
  customerId: string;
  messageContent: string;
  sender: string;
  channel: string;
  externalMessageId: string;
  metadata?: MessageMetadata;
};

export type MessageProps = {
  id: string;
  userId: string;
  customerId: string;
  messageContent: string;
  sender: MessageSender;
  channel: MessageChannel;
  externalMessageId: string;
  metadata?: MessageMetadata;
  createdAt?: Date;
  updatedAt?: Date;
  deletedAt?: Date | null;
};

export type MessageSnapshot = {
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
  deletedAt: Date | null;
};
