import { Command } from '@common/application/cqrs';

export type MarkCustomerPackageUnpaidCommandPayload = {
  userId: string;
  customerPackageId: string;
};

export class MarkCustomerPackageUnpaidCommand extends Command<MarkCustomerPackageUnpaidCommandPayload> {
  constructor(payload: MarkCustomerPackageUnpaidCommandPayload) {
    super(payload);
  }
}
