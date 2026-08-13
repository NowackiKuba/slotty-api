import { Inject } from '@nestjs/common';
import { QueryHandler, type IQueryHandler } from '@common/application/cqrs';
import { PaginatedResult } from '@common/pagination';
import { ListCustomersQuery } from './list-customers.query';
import type { CustomerWithFullDetailsReadModel } from '@customers/application/read-models';
import { CustomerReadModelMapper } from '@customers/application/mappers';
import type { ICustomerRepository } from '@customers/domain/repositories';
import { CUSTOMER_REPOSITORY } from '@customers/domain/tokens';

@QueryHandler(ListCustomersQuery)
export class ListCustomersHandler implements IQueryHandler<
  ListCustomersQuery,
  PaginatedResult<CustomerWithFullDetailsReadModel>
> {
  constructor(
    private readonly mapper: CustomerReadModelMapper,
    @Inject(CUSTOMER_REPOSITORY)
    private readonly customerRepository: ICustomerRepository,
  ) {}

  async execute(
    query: ListCustomersQuery,
  ): Promise<PaginatedResult<CustomerWithFullDetailsReadModel>> {
    const { userId, ...pagination } = query.payload;
    const result = await this.customerRepository.findByUserId(
      userId,
      pagination,
    );

    return PaginatedResult.create(
      result.data.map((customer) =>
        this.mapper.toReadModelWithFullDetails(customer),
      ),
      result.meta.total,
      pagination,
    );
  }
}
