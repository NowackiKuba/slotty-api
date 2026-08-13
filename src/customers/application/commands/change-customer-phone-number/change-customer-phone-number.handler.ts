import { Inject } from '@nestjs/common';
import { CommandHandler, type ICommandHandler } from '@common/application/cqrs';
import { ChangeCustomerPhoneNumberCommand } from './change-customer-phone-number.command';
import type { CustomerWithFullDetailsReadModel } from '@customers/application/read-models';
import { CustomerReadModelMapper } from '@customers/application/mappers';
import { assertCustomerUniqueForUser } from '@customers/application/assert-customer-unique';
import { getOwnedCustomer } from '@customers/application/get-owned-customer';
import type { ICustomerRepository } from '@customers/domain/repositories';
import { CUSTOMER_REPOSITORY } from '@customers/domain/tokens';

@CommandHandler(ChangeCustomerPhoneNumberCommand)
export class ChangeCustomerPhoneNumberHandler implements ICommandHandler<
  ChangeCustomerPhoneNumberCommand,
  CustomerWithFullDetailsReadModel
> {
  constructor(
    private readonly mapper: CustomerReadModelMapper,
    @Inject(CUSTOMER_REPOSITORY)
    private readonly customerRepository: ICustomerRepository,
  ) {}

  async execute(
    command: ChangeCustomerPhoneNumberCommand,
  ): Promise<CustomerWithFullDetailsReadModel> {
    const { customerId, phoneNumber, userId } = command.payload;
    const customer = await getOwnedCustomer(
      this.customerRepository,
      customerId,
      userId,
    );

    customer.changePhoneNumber(phoneNumber ?? undefined);
    await assertCustomerUniqueForUser(this.customerRepository, customer);
    await this.customerRepository.save(customer);

    return this.mapper.toReadModelWithFullDetails(customer);
  }
}
