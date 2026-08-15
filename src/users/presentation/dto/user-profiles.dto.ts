import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';
import { Currency } from '@common/domain/enums';
import { PaymentMethod, SettlementType, Sport } from '@users/domain/enums';

const locationPointSchema = z.object({
  name: z.string().min(1).max(200).optional(),
  address: z.string().min(1).max(300).optional(),
  lat: z.number().min(-90).max(90),
  lng: z.number().min(-180).max(180),
});

const paymentDetailsSchema = z.object({
  blikPhone: z
    .string()
    .regex(/^\d{9}$/)
    .optional(),
  bank: z
    .object({
      account: z.string().min(1).max(64),
      recipient: z.string().min(1).max(120),
      titleTemplate: z.string().min(1).max(140),
    })
    .optional(),
});

const atLeastOneField = (value: object) => Object.keys(value).length > 0;

export const createUserProfileSchema = z
  .object({
    sports: z.array(z.nativeEnum(Sport)).min(1),
    nickname: z.string().max(40).optional(),
    bio: z.string().max(2000).optional(),
    avatarUrl: z.string().url().or(z.literal('')).optional(),
    places: z.array(locationPointSchema).default([]),
    withTravel: z.boolean().optional(),
    pricePerSession: z.number().int().min(0),
    currency: z.nativeEnum(Currency).optional(),
    sessionDurationMinutes: z.number().int().min(15).max(480),
    courtFeeIncluded: z.boolean().optional(),
    maxGroupSize: z.number().int().min(1).max(50).optional(),
    cancellationWindowHours: z.number().int().min(0).max(168).optional(),
    settlementType: z.nativeEnum(SettlementType).optional(),
    paymentMethods: z.array(z.nativeEnum(PaymentMethod)).optional(),
    paymentDetails: paymentDetailsSchema.optional(),
    aiEnabled: z.boolean().optional(),
    autoConfirmBookings: z.boolean().optional(),
    aiCustomInstructions: z.array(z.string().min(1).max(500)).optional(),
    googleCalendarId: z.string().max(256).nullable().optional(),
  })
  .refine((value) => value.places.length > 0 || value.withTravel === true, {
    message: 'at least one place is required when travel is disabled',
    path: ['places'],
  });

export class CreateUserProfileDto extends createZodDto(
  createUserProfileSchema,
) {}

export const changeUserProfileDetailsSchema = z
  .object({
    nickname: z.string().max(40).optional(),
    bio: z.string().max(2000).optional(),
    avatarUrl: z.string().url().or(z.literal('')).optional(),
  })
  .refine(atLeastOneField, { message: 'at least one field is required' });

export class ChangeUserProfileDetailsDto extends createZodDto(
  changeUserProfileDetailsSchema,
) {}

export const changeUserProfileSportsSchema = z.object({
  sports: z.array(z.nativeEnum(Sport)).min(1),
});

export class ChangeUserProfileSportsDto extends createZodDto(
  changeUserProfileSportsSchema,
) {}

export const changeUserProfileLocationsSchema = z
  .object({
    places: z.array(locationPointSchema).optional(),
    withTravel: z.boolean().optional(),
  })
  .refine(atLeastOneField, { message: 'at least one field is required' });

export class ChangeUserProfileLocationsDto extends createZodDto(
  changeUserProfileLocationsSchema,
) {}

export const changeUserProfilePricingSchema = z
  .object({
    pricePerSession: z.number().int().min(0).optional(),
    currency: z.nativeEnum(Currency).optional(),
    sessionDurationMinutes: z.number().int().min(15).max(480).optional(),
    courtFeeIncluded: z.boolean().optional(),
    maxGroupSize: z.number().int().min(1).max(50).nullable().optional(),
  })
  .refine(atLeastOneField, { message: 'at least one field is required' });

export class ChangeUserProfilePricingDto extends createZodDto(
  changeUserProfilePricingSchema,
) {}

export const changeUserProfilePaymentsSchema = z
  .object({
    settlementType: z.nativeEnum(SettlementType).optional(),
    paymentMethods: z.array(z.nativeEnum(PaymentMethod)).optional(),
    paymentDetails: paymentDetailsSchema.nullable().optional(),
    cancellationWindowHours: z
      .number()
      .int()
      .min(0)
      .max(168)
      .nullable()
      .optional(),
  })
  .refine(atLeastOneField, { message: 'at least one field is required' });

export class ChangeUserProfilePaymentsDto extends createZodDto(
  changeUserProfilePaymentsSchema,
) {}

export const changeUserProfileAiSchema = z
  .object({
    aiEnabled: z.boolean().optional(),
    autoConfirmBookings: z.boolean().optional(),
    aiCustomInstructions: z.array(z.string().min(1).max(500)).optional(),
    googleCalendarId: z.string().max(256).nullable().optional(),
  })
  .refine(atLeastOneField, { message: 'at least one field is required' });

export class ChangeUserProfileAiDto extends createZodDto(
  changeUserProfileAiSchema,
) {}
