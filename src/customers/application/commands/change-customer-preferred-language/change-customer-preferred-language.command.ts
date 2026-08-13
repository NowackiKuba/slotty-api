import { Command } from '@common/application/cqrs';

export type ChangeCustomerPreferredLanguageCommandPayload = {
  userId: string;
  customerId: string;
  preferredLanguage: string;
};

export class ChangeCustomerPreferredLanguageCommand extends Command<ChangeCustomerPreferredLanguageCommandPayload> {
  constructor(payload: ChangeCustomerPreferredLanguageCommandPayload) {
    super(payload);
  }
}
