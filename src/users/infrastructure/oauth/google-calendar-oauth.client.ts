import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { OAuth2Client } from 'google-auth-library';
import { IntegrationProviderEnum } from '@users/domain/enums';
import {
  IntegrationOAuthExchangeFailedException,
  IntegrationOAuthNotConfiguredException,
} from '@users/domain/exceptions/integration';
import type {
  IntegrationOAuthClient,
  IntegrationOAuthConnection,
} from './integration-oauth.types';

const GOOGLE_AUTH_BASE = 'https://accounts.google.com/o/oauth2/v2/auth';
const CALENDAR_SCOPES = [
  'https://www.googleapis.com/auth/calendar',
  'https://www.googleapis.com/auth/calendar.events',
  'openid',
  'email',
  'profile',
];

@Injectable()
export class GoogleCalendarOAuthClient implements IntegrationOAuthClient {
  readonly provider = IntegrationProviderEnum.GOOGLE_CALENDAR;

  private readonly clientId: string;
  private readonly clientSecret: string;
  private readonly redirectUri: string;

  constructor(private readonly config: ConfigService) {
    this.clientId = this.require('GOOGLE_INTEGRATION_CLIENT_ID');
    this.clientSecret = this.require('GOOGLE_INTEGRATION_CLIENT_SECRET');
    this.redirectUri =
      config.get<string>('GOOGLE_INTEGRATION_REDIRECT_URI')?.trim() ||
      this.defaultRedirectUri();
  }

  buildAuthorizationUrl(state: string): string {
    const params = new URLSearchParams({
      client_id: this.clientId,
      redirect_uri: this.redirectUri,
      response_type: 'code',
      scope: CALENDAR_SCOPES.join(' '),
      access_type: 'offline',
      prompt: 'consent',
      state,
      include_granted_scopes: 'true',
    });

    return `${GOOGLE_AUTH_BASE}?${params.toString()}`;
  }

  async exchangeCode(code: string): Promise<IntegrationOAuthConnection> {
    const oauthClient = new OAuth2Client(
      this.clientId,
      this.clientSecret,
      this.redirectUri,
    );

    try {
      const { tokens } = await oauthClient.getToken(code);

      if (!tokens.access_token) {
        throw new IntegrationOAuthExchangeFailedException(
          this.provider,
          'Missing access token in Google response',
        );
      }

      oauthClient.setCredentials(tokens);

      const userInfo = await oauthClient.request<{ email?: string }>({
        url: 'https://www.googleapis.com/oauth2/v2/userinfo',
      });
      const calendarList = await oauthClient.request<{
        items?: Array<{ id: string; primary?: boolean; timeZone?: string }>;
      }>({
        url: 'https://www.googleapis.com/calendar/v3/users/me/calendarList?minAccessRole=owner',
      });

      const primaryCalendar =
        calendarList.data.items?.find((item) => item.primary) ??
        calendarList.data.items?.[0];

      if (!primaryCalendar?.id) {
        throw new IntegrationOAuthExchangeFailedException(
          this.provider,
          'No accessible Google Calendar found',
        );
      }

      return {
        accessToken: tokens.access_token,
        refreshToken: tokens.refresh_token ?? null,
        expiresAt: tokens.expiry_date ? new Date(tokens.expiry_date) : null,
        scopes: tokens.scope?.split(' ').filter(Boolean) ?? CALENDAR_SCOPES,
        externalAccountId: userInfo.data.email ?? null,
        settings: {
          defaultCalendarId: primaryCalendar.id,
          timeZone: primaryCalendar.timeZone,
        },
      };
    } catch (error) {
      if (error instanceof IntegrationOAuthExchangeFailedException) {
        throw error;
      }

      throw new IntegrationOAuthExchangeFailedException(
        this.provider,
        error instanceof Error ? error.message : 'Google OAuth exchange failed',
      );
    }
  }

  private require(key: string): string {
    const value = this.config.get<string>(key)?.trim();

    if (!value) {
      throw new IntegrationOAuthNotConfiguredException(this.provider, key);
    }

    return value;
  }

  private defaultRedirectUri(): string {
    const publicUrl = this.config
      .get<string>('API_PUBLIC_URL', 'http://localhost:3000')
      .replace(/\/$/, '');

    return `${publicUrl}/integrations/oauth/callback/${this.provider}`;
  }
}
