import { Command } from '@common/application/cqrs';

export type RecordCustomerSessionCommandPayload = {
  userId: string;
  customerId: string;
};

export class RecordCustomerSessionCommand extends Command<RecordCustomerSessionCommandPayload> {
  constructor(payload: RecordCustomerSessionCommandPayload) {
    super(payload);
  }
}
