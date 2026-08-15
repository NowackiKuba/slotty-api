import type { Currency } from '@common/domain/enums';
import type { CustomerPackageStatusValue } from '@packages/domain/value-objects';

export type CreateCustomerPackageProps = {
  id?: string;
  userId: string;
  customerId: string;
  packageTemplateId?: string | null;
  name: string;
  totalSessions: number;
  remainingSessions?: number;
  pricePaid: number;
  currency?: string;
  isPaid?: boolean;
  expiresAt?: Date | null;
};

export type CustomerPackageProps = {
  id: string;
  userId: string;
  customerId: string;
  packageTemplateId?: string | null;
  name: string;
  totalSessions: number;
  remainingSessions: number;
  pricePaid: number;
  currency: Currency;
  isPaid: boolean;
  status: CustomerPackageStatusValue;
  expiresAt?: Date | null;
  createdAt?: Date;
  updatedAt?: Date;
  deletedAt?: Date | null;
};

export type CustomerPackageSnapshot = {
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
  deletedAt: Date | null;
};
