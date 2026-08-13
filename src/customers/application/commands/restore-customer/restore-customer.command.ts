import { Command } from '@common/application/cqrs';

export type RestoreCustomerCommandPayload = {
  userId: string;
  customerId: string;
};

export class RestoreCustomerCommand extends Command<RestoreCustomerCommandPayload> {
  constructor(payload: RestoreCustomerCommandPayload) {
    super(payload);
  }
}
