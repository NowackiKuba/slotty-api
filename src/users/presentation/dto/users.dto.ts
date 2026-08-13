import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

export const renameUserSchema = z.object({
  firstName: z.string().min(1).max(100),
  lastName: z.string().min(1).max(100),
});

export class RenameUserDto extends createZodDto(renameUserSchema) {}

export const changeUserDisplayNameSchema = z.object({
  displayName: z.string().min(1).max(40),
});

export class ChangeUserDisplayNameDto extends createZodDto(
  changeUserDisplayNameSchema,
) {}

export const changeUserAvatarUrlSchema = z.object({
  avatarUrl: z.string().url().or(z.literal('')),
});

export class ChangeUserAvatarUrlDto extends createZodDto(
  changeUserAvatarUrlSchema,
) {}

export const changeUserTimezoneSchema = z.object({
  timezone: z.string().min(1).max(64),
});

export class ChangeUserTimezoneDto extends createZodDto(
  changeUserTimezoneSchema,
) {}
