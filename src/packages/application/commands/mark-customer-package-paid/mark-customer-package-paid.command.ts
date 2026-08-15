import { Command } from '@common/application/cqrs';

export type MarkCustomerPackagePaidCommandPayload = {
  userId: string;
  customerPackageId: string;
};

export class MarkCustomerPackagePaidCommand extends Command<MarkCustomerPackagePaidCommandPayload> {
  constructor(payload: MarkCustomerPackagePaidCommandPayload) {
    super(payload);
  }
}
