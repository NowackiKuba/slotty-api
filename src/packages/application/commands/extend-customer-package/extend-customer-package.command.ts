import { Command } from '@common/application/cqrs';

export type ExtendCustomerPackageCommandPayload = {
  userId: string;
  customerPackageId: string;
  expiresAt: Date | null;
};

export class ExtendCustomerPackageCommand extends Command<ExtendCustomerPackageCommandPayload> {
  constructor(payload: ExtendCustomerPackageCommandPayload) {
    super(payload);
  }
}
