import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

export const devLoginSchema = z.object({
  email: z.string().email().max(254),
  firstName: z.string().min(1).max(100).optional(),
  lastName: z.string().min(1).max(100).optional(),
  displayName: z.string().min(1).max(40).optional(),
});

export class DevLoginDto extends createZodDto(devLoginSchema) {}
