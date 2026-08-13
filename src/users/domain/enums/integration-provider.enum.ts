export enum IntegrationProviderEnum {
  GOOGLE_CALENDAR = 'GOOGLE_CALENDAR',
  INSTAGRAM_DM = 'INSTAGRAM_DM',
  WHATSAPP_CLOUD = 'WHATSAPP_CLOUD',
  SMS_PROVIDER = 'SMS_PROVIDER',
}

const INTEGRATION_PROVIDER_VALUES = new Set<string>(
  Object.values(IntegrationProviderEnum),
);

export function isIntegrationProvider(
  value: string,
): value is IntegrationProviderEnum {
  return INTEGRATION_PROVIDER_VALUES.has(value);
}
