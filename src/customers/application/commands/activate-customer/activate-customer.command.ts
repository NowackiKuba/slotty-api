import { Command } from '@common/application/cqrs';

export type ActivateCustomerCommandPayload = {
  userId: string;
  customerId: string;
};

export class ActivateCustomerCommand extends Command<ActivateCustomerCommandPayload> {
  constructor(payload: ActivateCustomerCommandPayload) {
    super(payload);
  }
}
