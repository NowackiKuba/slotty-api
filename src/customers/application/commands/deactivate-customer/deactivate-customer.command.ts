import { Command } from '@common/application/cqrs';

export type DeactivateCustomerCommandPayload = {
  userId: string;
  customerId: string;
};

export class DeactivateCustomerCommand extends Command<DeactivateCustomerCommandPayload> {
  constructor(payload: DeactivateCustomerCommandPayload) {
    super(payload);
  }
}
