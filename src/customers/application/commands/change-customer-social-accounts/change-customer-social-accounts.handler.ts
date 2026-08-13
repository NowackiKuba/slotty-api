import { Inject } from '@nestjs/common';
import { CommandHandler, type ICommandHandler } from '@common/application/cqrs';
import { ChangeCustomerSocialAccountsCommand } from './change-customer-social-accounts.command';
import type { CustomerWithFullDetailsReadModel } from '@customers/application/read-models';
import { CustomerReadModelMapper } from '@customers/application/mappers';
import { assertCustomerUniqueForUser } from '@customers/application/assert-customer-unique';
import { getOwnedCustomer } from '@customers/application/get-owned-customer';
import type { ICustomerRepository } from '@customers/domain/repositories';
import { CUSTOMER_REPOSITORY } from '@customers/domain/tokens';

@CommandHandler(ChangeCustomerSocialAccountsCommand)
export class ChangeCustomerSocialAccountsHandler implements ICommandHandler<
  ChangeCustomerSocialAccountsCommand,
  CustomerWithFullDetailsReadModel
> {
  constructor(
    private readonly mapper: CustomerReadModelMapper,
    @Inject(CUSTOMER_REPOSITORY)
    private readonly customerRepository: ICustomerRepository,
  ) {}

  async execute(
    command: ChangeCustomerSocialAccountsCommand,
  ): Promise<CustomerWithFullDetailsReadModel> {
    const { customerId, instagramAccountId, userId, whatsappAccountId } =
      command.payload;
    const customer = await getOwnedCustomer(
      this.customerRepository,
      customerId,
      userId,
    );

    customer.changeSocialAccounts({ instagramAccountId, whatsappAccountId });
    await assertCustomerUniqueForUser(this.customerRepository, customer);
    await this.customerRepository.save(customer);

    return this.mapper.toReadModelWithFullDetails(customer);
  }
}
