import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';
import { CustomerSource } from '@customers/domain/enums';

const nullableText = (max: number) =>
  z.union([z.string().max(max), z.literal('')]).nullable();

const atLeastOneField = (value: object) => Object.keys(value).length > 0;

export const createCustomerSchema = z.object({
  source: z.nativeEnum(CustomerSource),
  firstName: z.string().min(1).max(100),
  lastName: nullableText(100).optional(),
  nickname: nullableText(40).optional(),
  email: z
    .union([z.string().email().max(254), z.literal('')])
    .nullable()
    .optional(),
  phoneNumber: nullableText(20).optional(),
  avatarUrl: z.string().url().or(z.literal('')).nullable().optional(),
  instagramAccountId: nullableText(128).optional(),
  whatsappAccountId: nullableText(128).optional(),
});

export class CreateCustomerDto extends createZodDto(createCustomerSchema) {}

export const renameCustomerSchema = z.object({
  firstName: z.string().min(1).max(100),
  lastName: nullableText(100),
});

export class RenameCustomerDto extends createZodDto(renameCustomerSchema) {}

export const changeCustomerNicknameSchema = z.object({
  nickname: nullableText(40),
});

export class ChangeCustomerNicknameDto extends createZodDto(
  changeCustomerNicknameSchema,
) {}

export const changeCustomerEmailSchema = z.object({
  email: z.union([z.string().email().max(254), z.literal('')]).nullable(),
});

export class ChangeCustomerEmailDto extends createZodDto(
  changeCustomerEmailSchema,
) {}

export const changeCustomerPhoneNumberSchema = z.object({
  phoneNumber: nullableText(20),
});

export class ChangeCustomerPhoneNumberDto extends createZodDto(
  changeCustomerPhoneNumberSchema,
) {}

export const changeCustomerAvatarUrlSchema = z.object({
  avatarUrl: z.string().url().or(z.literal('')).nullable(),
});

export class ChangeCustomerAvatarUrlDto extends createZodDto(
  changeCustomerAvatarUrlSchema,
) {}

export const changeCustomerSocialAccountsSchema = z
  .object({
    instagramAccountId: nullableText(128).optional(),
    whatsappAccountId: nullableText(128).optional(),
  })
  .refine(atLeastOneField, { message: 'at least one field is required' });

export class ChangeCustomerSocialAccountsDto extends createZodDto(
  changeCustomerSocialAccountsSchema,
) {}

export const changeCustomerTrainingNotesSchema = z
  .object({
    equipmentToBring: z.array(z.string().min(1).max(80)).optional(),
    focusAreas: z.array(z.string().min(1).max(80)).optional(),
    healthNotes: nullableText(2000).optional(),
    generalNotes: nullableText(2000).optional(),
  })
  .refine(atLeastOneField, { message: 'at least one field is required' });

export class ChangeCustomerTrainingNotesDto extends createZodDto(
  changeCustomerTrainingNotesSchema,
) {}

export const changeCustomerAiOptOutSchema = z.object({
  aiOptOut: z.boolean(),
});

export class ChangeCustomerAiOptOutDto extends createZodDto(
  changeCustomerAiOptOutSchema,
) {}

export const changeCustomerPreferredLanguageSchema = z.object({
  preferredLanguage: z.string().min(2).max(8),
});

export class ChangeCustomerPreferredLanguageDto extends createZodDto(
  changeCustomerPreferredLanguageSchema,
) {}
