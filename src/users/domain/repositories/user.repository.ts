import type { PaginationInput } from '@common/pagination';
import type { PaginatedResult } from '@common/pagination';
import type { User } from '@users/domain/aggregates';
import type { UserId } from '@users/domain/value-objects';

export interface IUserRepository {
  findById(id: UserId): Promise<User | null>;
  findByIdIncludingDeleted(id: UserId): Promise<User | null>;
  findByEmail(email: string): Promise<User | null>;
  findByDisplayName(displayName: string): Promise<User | null>;
  findMany(query: PaginationInput): Promise<PaginatedResult<User>>;
  save(user: User): Promise<void>;
}
