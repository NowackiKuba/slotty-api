import { Inject } from '@nestjs/common';
import { QueryHandler, type IQueryHandler } from '@common/application/cqrs';
import { PaginatedResult } from '@common/pagination';
import { CustomerPackageReadModelMapper } from '@packages/application/mappers';
import type { CustomerPackageReadModel } from '@packages/application/read-models';
import type { ICustomerPackageRepository } from '@packages/domain/repositories';
import { CUSTOMER_PACKAGE_REPOSITORY } from '@packages/domain/tokens';
import { ListCustomerPackagesQuery } from './list-customer-packages.query';

@QueryHandler(ListCustomerPackagesQuery)
export class ListCustomerPackagesHandler implements IQueryHandler<
  ListCustomerPackagesQuery,
  PaginatedResult<CustomerPackageReadModel>
> {
  constructor(
    private readonly mapper: CustomerPackageReadModelMapper,
    @Inject(CUSTOMER_PACKAGE_REPOSITORY)
    private readonly customerPackageRepository: ICustomerPackageRepository,
  ) {}

  async execute(
    query: ListCustomerPackagesQuery,
  ): Promise<PaginatedResult<CustomerPackageReadModel>> {
    const { userId, ...pagination } = query.payload;
    const result = await this.customerPackageRepository.findByUserId(
      userId,
      pagination,
    );

    return PaginatedResult.create(
      result.data.map((row) => this.mapper.toReadModel(row)),
      result.meta.total,
      pagination,
    );
  }
}
