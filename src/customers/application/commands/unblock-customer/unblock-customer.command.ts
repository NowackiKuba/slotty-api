import { Command } from '@common/application/cqrs';

export type UnblockCustomerCommandPayload = {
  userId: string;
  customerId: string;
};

export class UnblockCustomerCommand extends Command<UnblockCustomerCommandPayload> {
  constructor(payload: UnblockCustomerCommandPayload) {
    super(payload);
  }
}
