import { Command } from '@common/application/cqrs';

export type SoftDeleteCustomerCommandPayload = {
  userId: string;
  customerId: string;
};

export class SoftDeleteCustomerCommand extends Command<SoftDeleteCustomerCommandPayload> {
  constructor(payload: SoftDeleteCustomerCommandPayload) {
    super(payload);
  }
}
