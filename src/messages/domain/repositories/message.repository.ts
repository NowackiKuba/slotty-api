import type { PaginationInput, PaginatedResult } from '@common/pagination';
import type { Message } from '@messages/domain/aggregates';
import type { MessageChannel } from '@messages/domain/enums';

export interface IMessageRepository {
  findById(id: string): Promise<Message | null>;
  findByIdIncludingDeleted(id: string): Promise<Message | null>;
  findByUserId(
    userId: string,
    query: PaginationInput,
  ): Promise<PaginatedResult<Message>>;
  findByCustomerId(
    userId: string,
    customerId: string,
    query: PaginationInput,
  ): Promise<PaginatedResult<Message>>;
  findByExternalMessageId(
    userId: string,
    channel: MessageChannel,
    externalMessageId: string,
  ): Promise<Message | null>;
  save(message: Message): Promise<void>;
}
