import { Command } from '@common/application/cqrs';

export type ChangeCustomerPhoneNumberCommandPayload = {
  userId: string;
  customerId: string;
  phoneNumber: string | null;
};

export class ChangeCustomerPhoneNumberCommand extends Command<ChangeCustomerPhoneNumberCommandPayload> {
  constructor(payload: ChangeCustomerPhoneNumberCommandPayload) {
    super(payload);
  }
}
