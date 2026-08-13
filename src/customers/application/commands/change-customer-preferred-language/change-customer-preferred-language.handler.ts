import { Inject } from '@nestjs/common';
import { CommandHandler, type ICommandHandler } from '@common/application/cqrs';
import { ChangeCustomerPreferredLanguageCommand } from './change-customer-preferred-language.command';
import type { CustomerWithFullDetailsReadModel } from '@customers/application/read-models';
import { CustomerReadModelMapper } from '@customers/application/mappers';
import { getOwnedCustomer } from '@customers/application/get-owned-customer';
import type { ICustomerRepository } from '@customers/domain/repositories';
import { CUSTOMER_REPOSITORY } from '@customers/domain/tokens';

@CommandHandler(ChangeCustomerPreferredLanguageCommand)
export class ChangeCustomerPreferredLanguageHandler implements ICommandHandler<
  ChangeCustomerPreferredLanguageCommand,
  CustomerWithFullDetailsReadModel
> {
  constructor(
    private readonly mapper: CustomerReadModelMapper,
    @Inject(CUSTOMER_REPOSITORY)
    private readonly customerRepository: ICustomerRepository,
  ) {}

  async execute(
    command: ChangeCustomerPreferredLanguageCommand,
  ): Promise<CustomerWithFullDetailsReadModel> {
    const { customerId, preferredLanguage, userId } = command.payload;
    const customer = await getOwnedCustomer(
      this.customerRepository,
      customerId,
      userId,
    );

    customer.changePreferredLanguage(preferredLanguage);
    await this.customerRepository.save(customer);

    return this.mapper.toReadModelWithFullDetails(customer);
  }
}
