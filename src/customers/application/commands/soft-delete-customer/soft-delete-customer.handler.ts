import { Inject } from '@nestjs/common';
import { CommandHandler, type ICommandHandler } from '@common/application/cqrs';
import { SoftDeleteCustomerCommand } from './soft-delete-customer.command';
import { getOwnedCustomer } from '@customers/application/get-owned-customer';
import type { ICustomerRepository } from '@customers/domain/repositories';
import { CUSTOMER_REPOSITORY } from '@customers/domain/tokens';

@CommandHandler(SoftDeleteCustomerCommand)
export class SoftDeleteCustomerHandler implements ICommandHandler<
  SoftDeleteCustomerCommand,
  void
> {
  constructor(
    @Inject(CUSTOMER_REPOSITORY)
    private readonly customerRepository: ICustomerRepository,
  ) {}

  async execute(command: SoftDeleteCustomerCommand): Promise<void> {
    const { customerId, userId } = command.payload;
    const customer = await getOwnedCustomer(
      this.customerRepository,
      customerId,
      userId,
    );

    customer.softDelete();
    await this.customerRepository.save(customer);
  }
}
