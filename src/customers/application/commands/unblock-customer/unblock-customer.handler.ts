import { Inject } from '@nestjs/common';
import { CommandHandler, type ICommandHandler } from '@common/application/cqrs';
import { UnblockCustomerCommand } from './unblock-customer.command';
import type { CustomerWithFullDetailsReadModel } from '@customers/application/read-models';
import { CustomerReadModelMapper } from '@customers/application/mappers';
import { getOwnedCustomer } from '@customers/application/get-owned-customer';
import type { ICustomerRepository } from '@customers/domain/repositories';
import { CUSTOMER_REPOSITORY } from '@customers/domain/tokens';
import { CustomerStatus } from '@customers/domain/value-objects';

@CommandHandler(UnblockCustomerCommand)
export class UnblockCustomerHandler implements ICommandHandler<
  UnblockCustomerCommand,
  CustomerWithFullDetailsReadModel
> {
  constructor(
    private readonly mapper: CustomerReadModelMapper,
    @Inject(CUSTOMER_REPOSITORY)
    private readonly customerRepository: ICustomerRepository,
  ) {}

  async execute(
    command: UnblockCustomerCommand,
  ): Promise<CustomerWithFullDetailsReadModel> {
    const { customerId, userId } = command.payload;
    const customer = await getOwnedCustomer(
      this.customerRepository,
      customerId,
      userId,
    );

    customer.changeStatus(CustomerStatus.inactive());
    await this.customerRepository.save(customer);

    return this.mapper.toReadModelWithFullDetails(customer);
  }
}
