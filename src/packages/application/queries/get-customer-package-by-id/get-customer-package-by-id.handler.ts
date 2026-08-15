import { Inject } from '@nestjs/common';
import { QueryHandler, type IQueryHandler } from '@common/application/cqrs';
import { getOwnedCustomerPackage } from '@packages/application/get-owned-customer-package';
import { CustomerPackageReadModelMapper } from '@packages/application/mappers';
import type { CustomerPackageReadModel } from '@packages/application/read-models';
import type { ICustomerPackageRepository } from '@packages/domain/repositories';
import { CUSTOMER_PACKAGE_REPOSITORY } from '@packages/domain/tokens';
import { GetCustomerPackageByIdQuery } from './get-customer-package-by-id.query';

@QueryHandler(GetCustomerPackageByIdQuery)
export class GetCustomerPackageByIdHandler implements IQueryHandler<
  GetCustomerPackageByIdQuery,
  CustomerPackageReadModel
> {
  constructor(
    private readonly mapper: CustomerPackageReadModelMapper,
    @Inject(CUSTOMER_PACKAGE_REPOSITORY)
    private readonly customerPackageRepository: ICustomerPackageRepository,
  ) {}

  async execute(
    query: GetCustomerPackageByIdQuery,
  ): Promise<CustomerPackageReadModel> {
    const { userId, customerPackageId } = query.payload;
    const customerPackage = await getOwnedCustomerPackage(
      this.customerPackageRepository,
      customerPackageId,
      userId,
    );

    return this.mapper.toReadModel(customerPackage);
  }
}
