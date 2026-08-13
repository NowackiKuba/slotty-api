import { Command } from '@common/application/cqrs';

export type RenameCustomerCommandPayload = {
  userId: string;
  customerId: string;
  firstName: string;
  lastName: string | null;
};

export class RenameCustomerCommand extends Command<RenameCustomerCommandPayload> {
  constructor(payload: RenameCustomerCommandPayload) {
    super(payload);
  }
}
