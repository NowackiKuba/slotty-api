import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';
import { BroadcastRecipientStatusEnum } from '@broadcasts/domain/enums';
import { MessageChannel } from '@messages/domain/enums';

const atLeastOneField = (value: object) => Object.keys(value).length > 0;

export const createBroadcastSchema = z.object({
  messageText: z.string().min(1).max(4096),
  targetChannel: z.nativeEnum(MessageChannel),
  scheduledAt: z.coerce.date().optional(),
  customerIds: z.array(z.string().uuid()).min(1),
});

export class CreateBroadcastDto extends createZodDto(createBroadcastSchema) {}

export const updateBroadcastSchema = z
  .object({
    messageText: z.string().min(1).max(4096).optional(),
    targetChannel: z.nativeEnum(MessageChannel).optional(),
    scheduledAt: z.coerce.date().optional(),
    customerIds: z.array(z.string().uuid()).min(1).optional(),
  })
  .refine(atLeastOneField, { message: 'at least one field is required' });

export class UpdateBroadcastDto extends createZodDto(updateBroadcastSchema) {}

export const updateBroadcastRecipientSchema = z.object({
  status: z.enum([
    BroadcastRecipientStatusEnum.PROCESSING,
    BroadcastRecipientStatusEnum.SENT,
    BroadcastRecipientStatusEnum.DELIVERED,
    BroadcastRecipientStatusEnum.FAILED,
  ]),
  messageId: z.string().uuid().optional(),
  errorMessage: z.string().min(1).max(1000).optional(),
});

export class UpdateBroadcastRecipientDto extends createZodDto(
  updateBroadcastRecipientSchema,
) {}
