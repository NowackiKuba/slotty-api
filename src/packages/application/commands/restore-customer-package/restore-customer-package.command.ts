import { Command } from '@common/application/cqrs';

export type RestoreCustomerPackageCommandPayload = {
  userId: string;
  customerPackageId: string;
};

export class RestoreCustomerPackageCommand extends Command<RestoreCustomerPackageCommandPayload> {
  constructor(payload: RestoreCustomerPackageCommandPayload) {
    super(payload);
  }
}
