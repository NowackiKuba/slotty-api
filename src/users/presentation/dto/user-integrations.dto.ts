import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';
import { IntegrationProviderEnum } from '@users/domain/enums';
import { validateIntegrationSettings } from '@users/application/validate-integration-settings';

export const connectUserIntegrationSchema = z
  .object({
    provider: z.nativeEnum(IntegrationProviderEnum),
    externalAccountId: z.string().max(256).nullable().optional(),
    accessToken: z.string().min(1),
    refreshToken: z.string().min(1).nullable().optional(),
    expiresAt: z.coerce.date().nullable().optional(),
    scopes: z.array(z.string().min(1).max(256)).optional(),
    settings: z.unknown().optional(),
  })
  .superRefine((value, ctx) => {
    if (value.settings === undefined) {
      return;
    }

    try {
      validateIntegrationSettings(value.provider, value.settings);
    } catch (error) {
      ctx.addIssue({
        code: 'custom',
        message:
          error instanceof Error ? error.message : 'invalid integration settings',
        path: ['settings'],
      });
    }
  });

export class ConnectUserIntegrationDto extends createZodDto(
  connectUserIntegrationSchema,
) {}

export const updateUserIntegrationSettingsSchema = z.object({
  settings: z.unknown(),
});

export class UpdateUserIntegrationSettingsDto extends createZodDto(
  updateUserIntegrationSettingsSchema,
) {}

export const updateUserIntegrationTokensSchema = z.object({
  accessToken: z.string().min(1),
  refreshToken: z.string().min(1).nullable().optional(),
  expiresAt: z.coerce.date().nullable().optional(),
});

export class UpdateUserIntegrationTokensDto extends createZodDto(
  updateUserIntegrationTokensSchema,
) {}

export const markUserIntegrationErrorSchema = z.object({
  message: z.string().min(1).max(2000),
});

export class MarkUserIntegrationErrorDto extends createZodDto(
  markUserIntegrationErrorSchema,
) {}
