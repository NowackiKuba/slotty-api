import { Inject } from '@nestjs/common';
import { CommandHandler, type ICommandHandler } from '@common/application/cqrs';
import { getOwnedCustomerPackage } from '@packages/application/get-owned-customer-package';
import { CustomerPackageAlreadyDeletedException } from '@packages/domain/exceptions';
import type { ICustomerPackageRepository } from '@packages/domain/repositories';
import { CUSTOMER_PACKAGE_REPOSITORY } from '@packages/domain/tokens';
import { SoftDeleteCustomerPackageCommand } from './soft-delete-customer-package.command';

@CommandHandler(SoftDeleteCustomerPackageCommand)
export class SoftDeleteCustomerPackageHandler implements ICommandHandler<
  SoftDeleteCustomerPackageCommand,
  string
> {
  constructor(
    @Inject(CUSTOMER_PACKAGE_REPOSITORY)
    private readonly customerPackageRepository: ICustomerPackageRepository,
  ) {}

  async execute(command: SoftDeleteCustomerPackageCommand): Promise<string> {
    const { userId, customerPackageId } = command.payload;
    const customerPackage = await getOwnedCustomerPackage(
      this.customerPackageRepository,
      customerPackageId,
      userId,
      { includeDeleted: true },
    );

    if (customerPackage.isDeleted) {
      throw new CustomerPackageAlreadyDeletedException({
        customerPackageId,
        userId,
      });
    }

    customerPackage.softDelete();
    await this.customerPackageRepository.save(customerPackage);

    return customerPackageId;
  }
}
