import type { Currency } from '@common/domain/enums';

export type PackageTemplateReadModel = {
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
};
