import type { BroadcastRecipientStatusValue } from '@broadcasts/domain/value-objects';

export type CreateBroadcastRecipientProps = {
  id?: string;
  broadcastId: string;
  customerId: string;
};

export type BroadcastRecipientProps = {
  id: string;
  broadcastId: string;
  customerId: string;
  status: BroadcastRecipientStatusValue;
  messageId?: string | null;
  sentAt?: Date | null;
  errorMessage?: string | null;
  createdAt?: Date;
  updatedAt?: Date;
  deletedAt?: Date | null;
};

export type BroadcastRecipientSnapshot = {
  id: string;
  broadcastId: string;
  customerId: string;
  status: BroadcastRecipientStatusValue;
  messageId: string | null;
  sentAt: Date | null;
  errorMessage: string | null;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
};
