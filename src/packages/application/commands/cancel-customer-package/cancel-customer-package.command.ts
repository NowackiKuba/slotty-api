import { Command } from '@common/application/cqrs';

export type CancelCustomerPackageCommandPayload = {
  userId: string;
  customerPackageId: string;
};

export class CancelCustomerPackageCommand extends Command<CancelCustomerPackageCommandPayload> {
  constructor(payload: CancelCustomerPackageCommandPayload) {
    super(payload);
  }
}
