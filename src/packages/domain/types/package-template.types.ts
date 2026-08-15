import type { Currency } from '@common/domain/enums';

export type CreatePackageTemplateProps = {
  id?: string;
  userId: string;
  name: string;
  description?: string;
  sessionCount: number;
  price: number;
  currency?: string;
  validityDays?: number | null;
  isActive?: boolean;
};

export type PackageTemplateProps = {
  id: string;
  userId: string;
  name: string;
  description?: string | null;
  sessionCount: number;
  price: number;
  currency: Currency;
  validityDays?: number | null;
  isActive: boolean;
  createdAt?: Date;
  updatedAt?: Date;
  deletedAt?: Date | null;
};

export type PackageTemplateSnapshot = {
  id: string;
  userId: string;
  name: string;
  description: string | null;
  sessionCount: number;
  price: number;
  currency: Currency;
  validityDays: number | null;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
};

export type ChangePackageTemplateDetailsProps = {
  name?: string;
  description?: string | null;
  sessionCount?: number;
  price?: number;
  currency?: string;
  validityDays?: number | null;
};
