import { Broadcast } from '@broadcasts/domain/aggregates';
import {
  BroadcastAccessDeniedException,
  BroadcastNotFoundException,
} from '@broadcasts/domain/exceptions';
import type { IBroadcastRepository } from '@broadcasts/domain/repositories';
import { BroadcastId } from '@broadcasts/domain/value-objects';

export async function getOwnedBroadcast(
  broadcastRepository: IBroadcastRepository,
  broadcastId: string,
  userId: string,
  options?: { includeDeleted?: boolean },
): Promise<Broadcast> {
  BroadcastId.create(broadcastId);

  const broadcast = options?.includeDeleted
    ? await broadcastRepository.findByIdIncludingDeleted(broadcastId)
    : await broadcastRepository.findById(broadcastId);

  if (!broadcast) {
    throw new BroadcastNotFoundException({ broadcastId, userId });
  }

  if (broadcast.userId.value !== userId) {
    throw new BroadcastAccessDeniedException({ broadcastId, userId });
  }

  return broadcast;
}
