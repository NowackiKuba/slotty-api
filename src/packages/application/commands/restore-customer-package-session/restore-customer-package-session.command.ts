import { Command } from '@common/application/cqrs';

export type RestoreCustomerPackageSessionCommandPayload = {
  userId: string;
  customerPackageId: string;
};

export class RestoreCustomerPackageSessionCommand extends Command<RestoreCustomerPackageSessionCommandPayload> {
  constructor(payload: RestoreCustomerPackageSessionCommandPayload) {
    super(payload);
  }
}
