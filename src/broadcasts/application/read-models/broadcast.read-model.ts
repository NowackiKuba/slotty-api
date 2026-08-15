import type { MessageChannel } from '@messages/domain/enums';
import type { BroadcastStatusValue } from '@broadcasts/domain/value-objects';
import type { BroadcastRecipientReadModel } from './broadcast-recipient.read-model';

export type BroadcastReadModel = {
  id: string;
  userId: string;
  messageText: string;
  targetChannel: MessageChannel;
  status: BroadcastStatusValue;
  scheduledAt: Date;
  sentCount: number;
  createdAt: Date;
  updatedAt: Date;
};

export type BroadcastDetailReadModel = BroadcastReadModel & {
  recipients: BroadcastRecipientReadModel[];
};
