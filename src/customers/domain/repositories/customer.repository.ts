import type { PaginationInput, PaginatedResult } from '@common/pagination';
import type { Customer } from '@customers/domain/aggregates';

export interface ICustomerRepository {
  findById(id: string): Promise<Customer | null>;
  findByIdIncludingDeleted(id: string): Promise<Customer | null>;
  findByUserId(
    userId: string,
    query: PaginationInput,
  ): Promise<PaginatedResult<Customer>>;
  findByUserIdAndEmail(userId: string, email: string): Promise<Customer | null>;
  findByUserIdAndPhone(
    userId: string,
    phoneNumber: string,
  ): Promise<Customer | null>;
  findByUserIdAndInstagramAccountId(
    userId: string,
    instagramAccountId: string,
  ): Promise<Customer | null>;
  findByUserIdAndWhatsappAccountId(
    userId: string,
    whatsappAccountId: string,
  ): Promise<Customer | null>;
  save(customer: Customer): Promise<void>;
}
