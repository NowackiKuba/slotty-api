import type { BroadcastRecipientStatusValue } from '@broadcasts/domain/value-objects';

export type BroadcastRecipientReadModel = {
  id: string;
  broadcastId: string;
  customerId: string;
  status: BroadcastRecipientStatusValue;
  messageId: string | null;
  sentAt: Date | null;
  errorMessage: string | null;
  createdAt: Date;
  updatedAt: Date;
};
