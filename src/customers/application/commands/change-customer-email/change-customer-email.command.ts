import { Command } from '@common/application/cqrs';

export type ChangeCustomerEmailCommandPayload = {
  userId: string;
  customerId: string;
  email: string | null;
};

export class ChangeCustomerEmailCommand extends Command<ChangeCustomerEmailCommandPayload> {
  constructor(payload: ChangeCustomerEmailCommandPayload) {
    super(payload);
  }
}
