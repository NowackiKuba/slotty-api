import { Inject } from '@nestjs/common';
import { CommandHandler, type ICommandHandler } from '@common/application/cqrs';
import { CreateCustomerCommand } from './create-customer.command';
import { CustomerWithFullDetailsReadModel } from '@customers/application/read-models';
import { CustomerReadModelMapper } from '@customers/application/mappers';
import { Customer } from '@customers/domain/aggregates';
import { assertCustomerUniqueForUser } from '@customers/application/assert-customer-unique';
import type { ICustomerRepository } from '@customers/domain/repositories';
import { CUSTOMER_REPOSITORY } from '@customers/domain/tokens';

@CommandHandler(CreateCustomerCommand)
export class CreateCustomerHandler implements ICommandHandler<
  CreateCustomerCommand,
  CustomerWithFullDetailsReadModel
> {
  constructor(
    private readonly mapper: CustomerReadModelMapper,
    @Inject(CUSTOMER_REPOSITORY)
    private readonly customerRepository: ICustomerRepository,
  ) {}

  async execute(
    command: CreateCustomerCommand,
  ): Promise<CustomerWithFullDetailsReadModel> {
    const {
      avatarUrl,
      email,
      firstName,
      instagramAccountId,
      lastName,
      nickname,
      phoneNumber,
      source,
      userId,
      whatsappAccountId,
    } = command.payload;

    const customer = Customer.create({
      userId,
      source,
      firstName,
      lastName: lastName ?? undefined,
      nickname: nickname ?? undefined,
      email: email ?? undefined,
      phoneNumber: phoneNumber ?? undefined,
      avatarUrl: avatarUrl ?? undefined,
      instagramAccountId: instagramAccountId ?? undefined,
      whatsappAccountId: whatsappAccountId ?? undefined,
    });

    await assertCustomerUniqueForUser(this.customerRepository, customer);
    await this.customerRepository.save(customer);

    return this.mapper.toReadModelWithFullDetails(customer);
  }
}
