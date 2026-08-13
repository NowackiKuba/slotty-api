import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

export const integrationOAuthCallbackQuerySchema = z.object({
  code: z.string().min(1).optional(),
  state: z.string().min(1).optional(),
  error: z.string().optional(),
  error_description: z.string().optional(),
});

export class IntegrationOAuthCallbackQueryDto extends createZodDto(
  integrationOAuthCallbackQuerySchema,
) {}
