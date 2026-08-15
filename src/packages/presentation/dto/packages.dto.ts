import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';
import { Currency } from '@common/domain/enums';

const atLeastOneField = (value: object) => Object.keys(value).length > 0;
const nullableText = (max: number) =>
  z.union([z.string().max(max), z.literal('')]).nullable();

export const createPackageTemplateSchema = z.object({
  name: z.string().min(1).max(120),
  description: z.string().max(2000).optional(),
  sessionCount: z.number().int().min(1),
  price: z.number().int().min(0),
  currency: z.nativeEnum(Currency).optional(),
  validityDays: z.number().int().min(1).nullable().optional(),
  isActive: z.boolean().optional(),
});

export class CreatePackageTemplateDto extends createZodDto(
  createPackageTemplateSchema,
) {}

export const updatePackageTemplateSchema = z
  .object({
    name: z.string().min(1).max(120).optional(),
    description: nullableText(2000).optional(),
    sessionCount: z.number().int().min(1).optional(),
    price: z.number().int().min(0).optional(),
    currency: z.nativeEnum(Currency).optional(),
    validityDays: z.number().int().min(1).nullable().optional(),
    isActive: z.boolean().optional(),
  })
  .refine(atLeastOneField, { message: 'at least one field is required' });

export class UpdatePackageTemplateDto extends createZodDto(
  updatePackageTemplateSchema,
) {}

export const createCustomerPackageSchema = z
  .object({
    customerId: z.string().uuid(),
    packageTemplateId: z.string().uuid().optional(),
    name: z.string().min(1).max(120).optional(),
    totalSessions: z.number().int().min(1).optional(),
    remainingSessions: z.number().int().min(0).optional(),
    pricePaid: z.number().int().min(0).optional(),
    currency: z.nativeEnum(Currency).optional(),
    isPaid: z.boolean().optional(),
    expiresAt: z.coerce.date().nullable().optional(),
  })
  .refine(
    (value) =>
      Boolean(value.packageTemplateId) ||
      (value.name !== undefined &&
        value.totalSessions !== undefined &&
        value.pricePaid !== undefined),
    {
      message:
        'packageTemplateId or name, totalSessions and pricePaid are required',
    },
  );

export class CreateCustomerPackageDto extends createZodDto(
  createCustomerPackageSchema,
) {}

export const extendCustomerPackageSchema = z.object({
  expiresAt: z.coerce.date().nullable(),
});

export class ExtendCustomerPackageDto extends createZodDto(
  extendCustomerPackageSchema,
) {}
