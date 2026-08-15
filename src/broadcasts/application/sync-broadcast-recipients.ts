import { BroadcastRecipient } from '@broadcasts/domain/aggregates';
import { InvalidBroadcastException } from '@broadcasts/domain/exceptions';
import type { IBroadcastRecipientRepository } from '@broadcasts/domain/repositories';
import { getOwnedCustomer } from '@customers/application/get-owned-customer';
import type { ICustomerRepository } from '@customers/domain/repositories';

export async function syncBroadcastRecipients(
  recipientRepository: IBroadcastRecipientRepository,
  customerRepository: ICustomerRepository,
  broadcastId: string,
  userId: string,
  customerIds: string[],
): Promise<BroadcastRecipient[]> {
  const uniqueCustomerIds = [...new Set(customerIds)];

  if (uniqueCustomerIds.length === 0) {
    throw new InvalidBroadcastException('at least one recipient is required', {
      field: 'customerIds',
    });
  }

  for (const customerId of uniqueCustomerIds) {
    await getOwnedCustomer(customerRepository, customerId, userId);
  }

  const existing =
    await recipientRepository.listByBroadcastIdIncludingDeleted(broadcastId);
  const wanted = new Set(uniqueCustomerIds);

  for (const recipient of existing) {
    if (wanted.has(recipient.customerId.value)) {
      if (recipient.isDeleted) {
        recipient.restore();
        await recipientRepository.save(recipient);
      }
      continue;
    }

    if (!recipient.isDeleted) {
      recipient.softDelete();
      await recipientRepository.save(recipient);
    }
  }

  const existingByCustomer = new Map(
    existing.map((recipient) => [recipient.customerId.value, recipient]),
  );

  for (const customerId of uniqueCustomerIds) {
    if (existingByCustomer.has(customerId)) {
      continue;
    }

    const created = BroadcastRecipient.create({
      broadcastId,
      customerId,
    });
    await recipientRepository.save(created);
  }

  return recipientRepository.listByBroadcastId(broadcastId);
}
