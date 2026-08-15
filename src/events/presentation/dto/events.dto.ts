import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';
import { Currency } from '@common/domain/enums';
import { EventSource, EventType } from '@events/domain/enums';
import { PaymentMethod } from '@users/domain/enums';

const nullableText = (max: number) =>
  z.union([z.string().max(max), z.literal('')]).nullable();

const atLeastOneField = (value: object) => Object.keys(value).length > 0;

const dateAfterStart = (value: { startDate: Date; endDate: Date }) =>
  value.endDate.getTime() > value.startDate.getTime();

export const createEventSchema = z
  .object({
    customerId: z.union([z.string().uuid(), z.literal('')]).optional(),
    type: z.nativeEnum(EventType),
    price: z.number().int().min(0),
    paymentMethod: z.nativeEnum(PaymentMethod).optional(),
    currency: z.nativeEnum(Currency),
    location: nullableText(500).optional(),
    source: z.nativeEnum(EventSource).optional(),
    title: z.string().min(1).max(200),
    description: nullableText(2000).optional(),
    startDate: z.coerce.date(),
    endDate: z.coerce.date(),
    preSessionPlan: nullableText(2000).optional(),
    postSessionNotes: nullableText(2000).optional(),
  })
  .refine(dateAfterStart, {
    message: 'end date must be after start date',
    path: ['endDate'],
  });

export class CreateEventDto extends createZodDto(createEventSchema) {}

export const updateEventSchema = z
  .object({
    customerId: z.string().uuid().nullable().optional(),
    type: z.nativeEnum(EventType).optional(),
    price: z.number().int().min(0).optional(),
    paymentMethod: z.nativeEnum(PaymentMethod).nullable().optional(),
    currency: z.nativeEnum(Currency).optional(),
    location: nullableText(500).optional(),
    title: z.string().min(1).max(200).optional(),
    description: nullableText(2000).optional(),
    startDate: z.coerce.date().optional(),
    endDate: z.coerce.date().optional(),
    googleCalendarId: nullableText(256).optional(),
    googleEventId: nullableText(256).optional(),
    preSessionPlan: nullableText(2000).optional(),
    postSessionNotes: nullableText(2000).optional(),
    isPaymentApplicableYet: z.boolean().optional(),
    isPaid: z.boolean().optional(),
  })
  .refine(atLeastOneField, { message: 'at least one field is required' })
  .refine(
    (value) =>
      value.startDate === undefined ||
      value.endDate === undefined ||
      value.endDate.getTime() > value.startDate.getTime(),
    {
      message: 'end date must be after start date',
      path: ['endDate'],
    },
  );

export class UpdateEventDto extends createZodDto(updateEventSchema) {}

export const cancelEventSchema = z.object({
  byWho: z.enum(['TRAINER', 'CUSTOMER']),
});

export class CancelEventDto extends createZodDto(cancelEventSchema) {}

export const listEventsInRangeSchema = z
  .object({
    from: z.coerce.date(),
    to: z.coerce.date(),
    customerId: z.union([z.string().uuid(), z.literal('')]).optional(),
  })
  .refine((value) => value.to.getTime() > value.from.getTime(), {
    message: 'to must be after from',
    path: ['to'],
  });

export class ListEventsInRangeQueryDto extends createZodDto(
  listEventsInRangeSchema,
) {}
