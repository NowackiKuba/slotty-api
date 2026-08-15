import { Command } from '@common/application/cqrs';

export type ExpireCustomerPackageCommandPayload = {
  userId: string;
  customerPackageId: string;
};

export class ExpireCustomerPackageCommand extends Command<ExpireCustomerPackageCommandPayload> {
  constructor(payload: ExpireCustomerPackageCommandPayload) {
    super(payload);
  }
}
