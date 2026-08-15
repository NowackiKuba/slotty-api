import type { PaginationInput, PaginatedResult } from '@common/pagination';
import type { Event } from '@events/domain/aggregates';

export interface IEventRepository {
  findById(id: string): Promise<Event | null>;
  findByIdIncludingDeleted(id: string): Promise<Event | null>;
  findByUserId(
    userId: string,
    query: PaginationInput,
  ): Promise<PaginatedResult<Event>>;
  findByUserIdInRange(userId: string, from: Date, to: Date): Promise<Event[]>;
  findByCustomerIdInRange(
    customerId: string,
    from: Date,
    to: Date,
  ): Promise<Event[]>;
  findByGoogleEventId(
    userId: string,
    googleEventId: string,
  ): Promise<Event | null>;
  findOverlapping(
    userId: string,
    startDate: Date,
    endDate: Date,
    excludeEventId?: string,
  ): Promise<Event[]>;
  save(event: Event): Promise<void>;
}
