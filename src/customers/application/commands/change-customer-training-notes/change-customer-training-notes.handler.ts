import { Inject } from '@nestjs/common';
import { CommandHandler, type ICommandHandler } from '@common/application/cqrs';
import { ChangeCustomerTrainingNotesCommand } from './change-customer-training-notes.command';
import type { CustomerWithFullDetailsReadModel } from '@customers/application/read-models';
import { CustomerReadModelMapper } from '@customers/application/mappers';
import { getOwnedCustomer } from '@customers/application/get-owned-customer';
import type { ICustomerRepository } from '@customers/domain/repositories';
import { CUSTOMER_REPOSITORY } from '@customers/domain/tokens';

@CommandHandler(ChangeCustomerTrainingNotesCommand)
export class ChangeCustomerTrainingNotesHandler implements ICommandHandler<
  ChangeCustomerTrainingNotesCommand,
  CustomerWithFullDetailsReadModel
> {
  constructor(
    private readonly mapper: CustomerReadModelMapper,
    @Inject(CUSTOMER_REPOSITORY)
    private readonly customerRepository: ICustomerRepository,
  ) {}

  async execute(
    command: ChangeCustomerTrainingNotesCommand,
  ): Promise<CustomerWithFullDetailsReadModel> {
    const {
      customerId,
      equipmentToBring,
      focusAreas,
      generalNotes,
      healthNotes,
      userId,
    } = command.payload;
    const customer = await getOwnedCustomer(
      this.customerRepository,
      customerId,
      userId,
    );

    customer.changeTrainingNotes({
      equipmentToBring,
      focusAreas,
      healthNotes,
      generalNotes,
    });
    await this.customerRepository.save(customer);

    return this.mapper.toReadModelWithFullDetails(customer);
  }
}
