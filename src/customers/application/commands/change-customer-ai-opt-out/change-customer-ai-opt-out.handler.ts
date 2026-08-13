import { Inject } from '@nestjs/common';
import { CommandHandler, type ICommandHandler } from '@common/application/cqrs';
import { ChangeCustomerAiOptOutCommand } from './change-customer-ai-opt-out.command';
import type { CustomerWithFullDetailsReadModel } from '@customers/application/read-models';
import { CustomerReadModelMapper } from '@customers/application/mappers';
import { getOwnedCustomer } from '@customers/application/get-owned-customer';
import type { ICustomerRepository } from '@customers/domain/repositories';
import { CUSTOMER_REPOSITORY } from '@customers/domain/tokens';

@CommandHandler(ChangeCustomerAiOptOutCommand)
export class ChangeCustomerAiOptOutHandler implements ICommandHandler<
  ChangeCustomerAiOptOutCommand,
  CustomerWithFullDetailsReadModel
> {
  constructor(
    private readonly mapper: CustomerReadModelMapper,
    @Inject(CUSTOMER_REPOSITORY)
    private readonly customerRepository: ICustomerRepository,
  ) {}

  async execute(
    command: ChangeCustomerAiOptOutCommand,
  ): Promise<CustomerWithFullDetailsReadModel> {
    const { aiOptOut, customerId, userId } = command.payload;
    const customer = await getOwnedCustomer(
      this.customerRepository,
      customerId,
      userId,
    );

    customer.changeAiOptOut(aiOptOut);
    await this.customerRepository.save(customer);

    return this.mapper.toReadModelWithFullDetails(customer);
  }
}
