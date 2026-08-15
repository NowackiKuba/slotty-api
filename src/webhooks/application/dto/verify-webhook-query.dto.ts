import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

export const verifyWebhookQuerySchema = z
  .object({
    'hub.mode': z.string().optional(),
    'hub.verify_token': z.string().optional(),
    'hub.challenge': z.string().optional(),
  })
  .passthrough();

export class VerifyWebhookQueryDto extends createZodDto(
  verifyWebhookQuerySchema,
) {}
