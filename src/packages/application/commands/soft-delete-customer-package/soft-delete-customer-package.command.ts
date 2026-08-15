import { Command } from '@common/application/cqrs';

export type SoftDeleteCustomerPackageCommandPayload = {
  userId: string;
  customerPackageId: string;
};

export class SoftDeleteCustomerPackageCommand extends Command<SoftDeleteCustomerPackageCommandPayload> {
  constructor(payload: SoftDeleteCustomerPackageCommandPayload) {
    super(payload);
  }
}
