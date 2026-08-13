import { Command } from '@common/application/cqrs';

export type BlockCustomerCommandPayload = {
  userId: string;
  customerId: string;
};

export class BlockCustomerCommand extends Command<BlockCustomerCommandPayload> {
  constructor(payload: BlockCustomerCommandPayload) {
    super(payload);
  }
}
