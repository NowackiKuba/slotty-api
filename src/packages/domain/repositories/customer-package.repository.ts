import type { PaginationInput, PaginatedResult } from '@common/pagination';
import type { CustomerPackage } from '@packages/domain/aggregates';

export interface ICustomerPackageRepository {
  findById(id: string): Promise<CustomerPackage | null>;
  findByIdIncludingDeleted(id: string): Promise<CustomerPackage | null>;
  findByUserId(
    userId: string,
    query: PaginationInput,
  ): Promise<PaginatedResult<CustomerPackage>>;
  listByCustomerId(
    userId: string,
    customerId: string,
  ): Promise<CustomerPackage[]>;
  save(customerPackage: CustomerPackage): Promise<void>;
}
