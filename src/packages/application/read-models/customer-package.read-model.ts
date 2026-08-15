import type { Currency } from '@common/domain/enums';
import type { CustomerPackageStatusValue } from '@packages/domain/value-objects';

export type CustomerPackageReadModel = {
  id: string;
  userId: string;
  customerId: string;
  packageTemplateId: string | null;
  name: string;
  totalSessions: number;
  remainingSessions: number;
  pricePaid: number;
  currency: Currency;
  isPaid: boolean;
  status: CustomerPackageStatusValue;
  expiresAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
};
