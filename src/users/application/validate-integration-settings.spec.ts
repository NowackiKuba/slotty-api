import { IntegrationProviderEnum } from '@users/domain/enums';
import { InvalidUserIntegrationException } from '@users/domain/exceptions/integration';
import { validateIntegrationSettings } from '@users/application/validate-integration-settings';

describe('validateIntegrationSettings', () => {
  it('accepts google calendar settings', () => {
    const settings = validateIntegrationSettings(
      IntegrationProviderEnum.GOOGLE_CALENDAR,
      {
        defaultCalendarId: 'primary',
        timeZone: 'Europe/Warsaw',
      },
    );

    expect(settings).toEqual({
      defaultCalendarId: 'primary',
      timeZone: 'Europe/Warsaw',
    });
  });

  it('rejects invalid whatsapp settings', () => {
    expect(() =>
      validateIntegrationSettings(IntegrationProviderEnum.WHATSAPP_CLOUD, {
        phoneNumberId: '123',
      }),
    ).toThrow(InvalidUserIntegrationException);
  });

  it('accepts empty sms settings', () => {
    expect(
      validateIntegrationSettings(IntegrationProviderEnum.SMS_PROVIDER, {}),
    ).toEqual({});
  });
});
