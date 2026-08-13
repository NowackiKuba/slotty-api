import { Inject } from '@nestjs/common';
import { CommandHandler, type ICommandHandler } from '@common/application/cqrs';
import { ChangeCustomerNicknameCommand } from './change-customer-nickname.command';
import type { CustomerWithFullDetailsReadModel } from '@customers/application/read-models';
import { CustomerReadModelMapper } from '@customers/application/mappers';
import { getOwnedCustomer } from '@customers/application/get-owned-customer';
import type { ICustomerRepository } from '@customers/domain/repositories';
import { CUSTOMER_REPOSITORY } from '@customers/domain/tokens';

@CommandHandler(ChangeCustomerNicknameCommand)
export class ChangeCustomerNicknameHandler implements ICommandHandler<
  ChangeCustomerNicknameCommand,
  CustomerWithFullDetailsReadModel
> {
  constructor(
    private readonly mapper: CustomerReadModelMapper,
    @Inject(CUSTOMER_REPOSITORY)
    private readonly customerRepository: ICustomerRepository,
  ) {}

  async execute(
    command: ChangeCustomerNicknameCommand,
  ): Promise<CustomerWithFullDetailsReadModel> {
    const { customerId, nickname, userId } = command.payload;
    const customer = await getOwnedCustomer(
      this.customerRepository,
      customerId,
      userId,
    );

    customer.changeNickname(nickname ?? undefined);
    await this.customerRepository.save(customer);

    return this.mapper.toReadModelWithFullDetails(customer);
  }
}
