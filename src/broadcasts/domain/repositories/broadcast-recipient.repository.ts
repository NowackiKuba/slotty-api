import type { BroadcastRecipient } from '@broadcasts/domain/aggregates';

export interface IBroadcastRecipientRepository {
  findById(id: string): Promise<BroadcastRecipient | null>;
  findByBroadcastIdAndCustomerId(
    broadcastId: string,
    customerId: string,
  ): Promise<BroadcastRecipient | null>;
  findByBroadcastIdAndCustomerIdIncludingDeleted(
    broadcastId: string,
    customerId: string,
  ): Promise<BroadcastRecipient | null>;
  listByBroadcastId(broadcastId: string): Promise<BroadcastRecipient[]>;
  listByBroadcastIdIncludingDeleted(
    broadcastId: string,
  ): Promise<BroadcastRecipient[]>;
  save(recipient: BroadcastRecipient): Promise<void>;
}
