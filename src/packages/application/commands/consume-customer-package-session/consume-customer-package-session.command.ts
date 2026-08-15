import { Command } from '@common/application/cqrs';

export type ConsumeCustomerPackageSessionCommandPayload = {
  userId: string;
  customerPackageId: string;
};

export class ConsumeCustomerPackageSessionCommand extends Command<ConsumeCustomerPackageSessionCommandPayload> {
  constructor(payload: ConsumeCustomerPackageSessionCommandPayload) {
    super(payload);
  }
}
