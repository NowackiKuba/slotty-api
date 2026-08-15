import { Inject } from '@nestjs/common';
import { CommandHandler, type ICommandHandler } from '@common/application/cqrs';
import { getOwnedCustomerPackage } from '@packages/application/get-owned-customer-package';
import { CustomerPackageReadModelMapper } from '@packages/application/mappers';
import type { CustomerPackageReadModel } from '@packages/application/read-models';
import type { ICustomerPackageRepository } from '@packages/domain/repositories';
import { CUSTOMER_PACKAGE_REPOSITORY } from '@packages/domain/tokens';
import { CancelCustomerPackageCommand } from './cancel-customer-package.command';

@CommandHandler(CancelCustomerPackageCommand)
export class CancelCustomerPackageHandler implements ICommandHandler<
  CancelCustomerPackageCommand,
  CustomerPackageReadModel
> {
  constructor(
    private readonly mapper: CustomerPackageReadModelMapper,
    @Inject(CUSTOMER_PACKAGE_REPOSITORY)
    private readonly customerPackageRepository: ICustomerPackageRepository,
  ) {}

  async execute(
    command: CancelCustomerPackageCommand,
  ): Promise<CustomerPackageReadModel> {
    const { userId, customerPackageId } = command.payload;
    const customerPackage = await getOwnedCustomerPackage(
      this.customerPackageRepository,
      customerPackageId,
      userId,
    );

    customerPackage.cancel();
    await this.customerPackageRepository.save(customerPackage);

    return this.mapper.toReadModel(customerPackage);
  }
}
