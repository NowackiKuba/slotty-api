import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

export const smsWebhookPayloadSchema = z.object({
  from: z.string().min(1).max(32),
  to: z.string().min(1).max(32),
  text: z.string().min(1).max(4096),
  externalMessageId: z.string().min(1).max(256),
});

export class SmsWebhookPayloadDto extends createZodDto(
  smsWebhookPayloadSchema,
) {}
