import { IntegrationProviderEnum, IntegrationStatusEnum } from '@users/domain/enums';
import { UserIntegration } from '@users/domain/aggregates';
import {
  IntegrationStatus,
  UserId,
  UserIntegrationId,
} from '@users/domain/value-objects';

const USER_ID = '11111111-1111-4111-8111-111111111111';

describe('UserIntegration', () => {
  it('creates a connected integration with defaults', () => {
    const integration = UserIntegration.create({
      userId: USER_ID,
      provider: IntegrationProviderEnum.WHATSAPP_CLOUD,
      accessToken: 'access-token',
      settings: {
        phoneNumberId: '123',
        wabaId: '456',
      },
    });

    expect(integration.status.value).toBe(IntegrationStatusEnum.CONNECTED);
    expect(integration.settings).toEqual({
      phoneNumberId: '123',
      wabaId: '456',
    });
    expect(integration.scopes).toEqual([]);
  });

  it('detects token expiry with a 5 minute buffer', () => {
    const integration = UserIntegration.reconstitute({
      id: UserIntegrationId.create('22222222-2222-4222-8222-222222222222'),
      userId: UserId.create(USER_ID),
      provider: IntegrationProviderEnum.GOOGLE_CALENDAR,
      status: IntegrationStatus.connected(),
      externalAccountId: null,
      accessToken: 'token',
      refreshToken: null,
      expiresAt: new Date(Date.now() + 4 * 60 * 1000),
      scopes: [],
      settings: { defaultCalendarId: 'primary' },
      lastSyncedAt: null,
      errorMessage: null,
    });

    expect(integration.isTokenExpired()).toBe(true);
  });

  it('updates tokens and clears error state', () => {
    const integration = UserIntegration.create({
      userId: USER_ID,
      provider: IntegrationProviderEnum.INSTAGRAM_DM,
      accessToken: 'old-token',
    });

    integration.markAsError('provider failure');
    integration.updateTokens('new-token', 'refresh-token', new Date(Date.now() + 3600_000));

    expect(integration.accessToken).toBe('new-token');
    expect(integration.refreshToken).toBe('refresh-token');
    expect(integration.status.value).toBe(IntegrationStatusEnum.CONNECTED);
    expect(integration.errorMessage).toBeNull();
  });

  it('disconnect clears credentials', () => {
    const integration = UserIntegration.create({
      userId: USER_ID,
      provider: IntegrationProviderEnum.SMS_PROVIDER,
      accessToken: 'token',
      refreshToken: 'refresh',
    });

    integration.disconnect();

    expect(integration.status.value).toBe(IntegrationStatusEnum.DISCONNECTED);
    expect(integration.accessToken).toBeNull();
    expect(integration.refreshToken).toBeNull();
  });
});
