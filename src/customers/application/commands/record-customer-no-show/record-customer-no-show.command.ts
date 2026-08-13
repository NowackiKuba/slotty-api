import { Command } from '@common/application/cqrs';

export type RecordCustomerNoShowCommandPayload = {
  userId: string;
  customerId: string;
};

export class RecordCustomerNoShowCommand extends Command<RecordCustomerNoShowCommandPayload> {
  constructor(payload: RecordCustomerNoShowCommandPayload) {
    super(payload);
  }
}
