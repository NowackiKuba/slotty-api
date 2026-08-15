import type { PaginationInput, PaginatedResult } from '@common/pagination';
import type { Broadcast } from '@broadcasts/domain/aggregates';

export interface IBroadcastRepository {
  findById(id: string): Promise<Broadcast | null>;
  findByIdIncludingDeleted(id: string): Promise<Broadcast | null>;
  findByUserId(
    userId: string,
    query: PaginationInput,
  ): Promise<PaginatedResult<Broadcast>>;
  save(broadcast: Broadcast): Promise<void>;
}
