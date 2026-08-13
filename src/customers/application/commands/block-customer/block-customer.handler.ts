import { Inject } from '@nestjs/common';
import { CommandHandler, type ICommandHandler } from '@common/application/cqrs';
import { BlockCustomerCommand } from './block-customer.command';
import type { CustomerWithFullDetailsReadModel } from '@customers/application/read-models';
import { CustomerReadModelMapper } from '@customers/application/mappers';
import { getOwnedCustomer } from '@customers/application/get-owned-customer';
import type { ICustomerRepository } from '@customers/domain/repositories';
import { CUSTOMER_REPOSITORY } from '@customers/domain/tokens';
import { CustomerStatus } from '@customers/domain/value-objects';

@CommandHandler(BlockCustomerCommand)
export class BlockCustomerHandler implements ICommandHandler<
  BlockCustomerCommand,
  CustomerWithFullDetailsReadModel
> {
  constructor(
    private readonly mapper: CustomerReadModelMapper,
    @Inject(CUSTOMER_REPOSITORY)
    private readonly customerRepository: ICustomerRepository,
  ) {}

  async execute(
    command: BlockCustomerCommand,
  ): Promise<CustomerWithFullDetailsReadModel> {
    const { customerId, userId } = command.payload;
    const customer = await getOwnedCustomer(
      this.customerRepository,
      customerId,
      userId,
    );

    customer.changeStatus(CustomerStatus.blocked());
    await this.customerRepository.save(customer);

    return this.mapper.toReadModelWithFullDetails(customer);
  }
}
