import { IntegrationProviderEnum } from '@users/domain/enums';
import { InvalidUserIntegrationException } from '@users/domain/exceptions/integration';
import type { IntegrationSettings } from '@users/domain/types';
import { z } from 'zod';

const googleCalendarSettingsSchema = z.object({
  defaultCalendarId: z.string().min(1).max(256),
  syncToken: z.string().max(512).optional(),
  timeZone: z.string().max(64).optional(),
});

const instagramSettingsSchema = z.object({
  instagramBusinessAccountId: z.string().min(1).max(128),
  facebookPageId: z.string().min(1).max(128),
  pageName: z.string().max(256).optional(),
});

const whatsAppSettingsSchema = z.object({
  phoneNumberId: z.string().min(1).max(128),
  wabaId: z.string().min(1).max(128),
  displayPhoneNumber: z.string().max(32).optional(),
});

const smsProviderSettingsSchema = z.object({}).strict();

const SETTINGS_SCHEMAS: Record<
  IntegrationProviderEnum,
  z.ZodType<IntegrationSettings>
> = {
  [IntegrationProviderEnum.GOOGLE_CALENDAR]: googleCalendarSettingsSchema,
  [IntegrationProviderEnum.INSTAGRAM_DM]: instagramSettingsSchema,
  [IntegrationProviderEnum.WHATSAPP_CLOUD]: whatsAppSettingsSchema,
  [IntegrationProviderEnum.SMS_PROVIDER]: smsProviderSettingsSchema,
};

export function validateIntegrationSettings(
  provider: IntegrationProviderEnum,
  settings: unknown,
): IntegrationSettings {
  const result = SETTINGS_SCHEMAS[provider].safeParse(settings);

  if (!result.success) {
    throw new InvalidUserIntegrationException('invalid integration settings', {
      provider,
      errors: result.error.issues,
    });
  }

  return result.data;
}
