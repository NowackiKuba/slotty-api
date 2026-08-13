import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

export const socialLoginSchema = z.object({
  idToken: z.string().min(1),
  firstName: z.string().min(1).max(100).optional(),
  lastName: z.string().min(1).max(100).optional(),
  displayName: z.string().min(1).max(40).optional(),
});

export class SocialLoginDto extends createZodDto(socialLoginSchema) {}
