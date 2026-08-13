import { Command } from '@common/application/cqrs';

export type ChangeCustomerSocialAccountsCommandPayload = {
  userId: string;
  customerId: string;
  instagramAccountId?: string | null;
  whatsappAccountId?: string | null;
};

export class ChangeCustomerSocialAccountsCommand extends Command<ChangeCustomerSocialAccountsCommandPayload> {
  constructor(payload: ChangeCustomerSocialAccountsCommandPayload) {
    super(payload);
  }
}
