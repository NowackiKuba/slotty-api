import type { MessageChannel } from '@messages/domain/enums';
import type { BroadcastStatusValue } from '@broadcasts/domain/value-objects';

export type CreateBroadcastProps = {
  id?: string;
  userId: string;
  messageText: string;
  targetChannel: string;
  scheduledAt?: Date;
};

export type BroadcastProps = {
  id: string;
  userId: string;
  messageText: string;
  targetChannel: MessageChannel;
  status: BroadcastStatusValue;
  scheduledAt: Date;
  sentCount: number;
  createdAt?: Date;
  updatedAt?: Date;
  deletedAt?: Date | null;
};

export type BroadcastSnapshot = {
  id: string;
  userId: string;
  messageText: string;
  targetChannel: MessageChannel;
  status: BroadcastStatusValue;
  scheduledAt: Date;
  sentCount: number;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
};

export type ChangeBroadcastDetailsProps = {
  messageText?: string;
  targetChannel?: string;
  scheduledAt?: Date;
};
