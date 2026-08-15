import { Command } from '@common/application/cqrs';

export type CreateCustomerPackageCommandPayload = {
  userId: string;
  customerId: string;
  packageTemplateId?: string;
  name?: string;
  totalSessions?: number;
  remainingSessions?: number;
  pricePaid?: number;
  currency?: string;
  isPaid?: boolean;
  expiresAt?: Date | null;
};

export class CreateCustomerPackageCommand extends Command<CreateCustomerPackageCommandPayload> {
  constructor(payload: CreateCustomerPackageCommandPayload) {
    super(payload);
  }
}
