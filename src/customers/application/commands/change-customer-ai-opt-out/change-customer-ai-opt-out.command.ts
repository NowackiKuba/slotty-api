import { Command } from '@common/application/cqrs';

export type ChangeCustomerAiOptOutCommandPayload = {
  userId: string;
  customerId: string;
  aiOptOut: boolean;
};

export class ChangeCustomerAiOptOutCommand extends Command<ChangeCustomerAiOptOutCommandPayload> {
  constructor(payload: ChangeCustomerAiOptOutCommandPayload) {
    super(payload);
  }
}
