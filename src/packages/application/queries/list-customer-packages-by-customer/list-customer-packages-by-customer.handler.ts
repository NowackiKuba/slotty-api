import { Inject } from '@nestjs/common';
import { QueryHandler, type IQueryHandler } from '@common/application/cqrs';
import { getOwnedCustomer } from '@customers/application/get-owned-customer';
import type { ICustomerRepository } from '@customers/domain/repositories';
import { CUSTOMER_REPOSITORY } from '@customers/domain/tokens';
import { CustomerPackageReadModelMapper } from '@packages/application/mappers';
import type { CustomerPackageReadModel } from '@packages/application/read-models';
import type { ICustomerPackageRepository } from '@packages/domain/repositories';
import { CUSTOMER_PACKAGE_REPOSITORY } from '@packages/domain/tokens';
import { ListCustomerPackagesByCustomerQuery } from './list-customer-packages-by-customer.query';

@QueryHandler(ListCustomerPackagesByCustomerQuery)
export class ListCustomerPackagesByCustomerHandler implements IQueryHandler<
  ListCustomerPackagesByCustomerQuery,
  CustomerPackageReadModel[]
> {
  constructor(
    private readonly mapper: CustomerPackageReadModelMapper,
    @Inject(CUSTOMER_PACKAGE_REPOSITORY)
    private readonly customerPackageRepository: ICustomerPackageRepository,
    @Inject(CUSTOMER_REPOSITORY)
    private readonly customerRepository: ICustomerRepository,
  ) {}

  async execute(
    query: ListCustomerPackagesByCustomerQuery,
  ): Promise<CustomerPackageReadModel[]> {
    const { userId, customerId } = query.payload;
    await getOwnedCustomer(this.customerRepository, customerId, userId);

    const packages = await this.customerPackageRepository.listByCustomerId(
      userId,
      customerId,
    );

    return packages.map((row) => this.mapper.toReadModel(row));
  }
}
