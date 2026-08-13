import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { IntegrationProviderEnum } from '@users/domain/enums';
import {
  IntegrationOAuthExchangeFailedException,
  IntegrationOAuthNotConfiguredException,
} from '@users/domain/exceptions/integration';
import type { IntegrationSettings } from '@users/domain/types';
import type {
  IntegrationOAuthClient,
  IntegrationOAuthConnection,
} from './integration-oauth.types';

const META_AUTH_BASE = 'https://www.facebook.com/v21.0/dialog/oauth';
const META_TOKEN_URL = 'https://graph.facebook.com/v21.0/oauth/access_token';
const META_GRAPH_URL = 'https://graph.facebook.com/v21.0';

type MetaTokenResponse = {
  access_token?: string;
  token_type?: string;
  expires_in?: number;
};

type MetaAccountsResponse = {
  data?: Array<{
    id: string;
    name?: string;
    instagram_business_account?: { id: string };
  }>;
};

type MetaWhatsappAccountsResponse = {
  data?: Array<{
    id: string;
    name?: string;
    phone_numbers?: { data?: Array<{ id: string; display_phone_number?: string }> };
  }>;
};

@Injectable()
export class MetaInstagramOAuthClient implements IntegrationOAuthClient {
  readonly provider = IntegrationProviderEnum.INSTAGRAM_DM;

  private readonly appId: string;
  private readonly appSecret: string;
  private readonly redirectUri: string;
  private readonly scopes = [
    'instagram_basic',
    'instagram_manage_messages',
    'pages_show_list',
    'pages_read_engagement',
    'pages_manage_metadata',
    'business_management',
  ];

  constructor(private readonly config: ConfigService) {
    this.appId = this.require('META_INTEGRATION_APP_ID');
    this.appSecret = this.require('META_INTEGRATION_APP_SECRET');
    this.redirectUri =
      config.get<string>('META_INSTAGRAM_INTEGRATION_REDIRECT_URI')?.trim() ||
      this.defaultRedirectUri(IntegrationProviderEnum.INSTAGRAM_DM);
  }

  buildAuthorizationUrl(state: string): string {
    const params = new URLSearchParams({
      client_id: this.appId,
      redirect_uri: this.redirectUri,
      response_type: 'code',
      scope: this.scopes.join(','),
      state,
    });

    return `${META_AUTH_BASE}?${params.toString()}`;
  }

  async exchangeCode(code: string): Promise<IntegrationOAuthConnection> {
    const shortLived = await this.exchangeForShortLivedToken(code);
    const longLived = await this.exchangeForLongLivedToken(shortLived.access_token!);
    const metadata = await this.fetchInstagramMetadata(longLived.access_token!);

    return {
      accessToken: longLived.access_token!,
      refreshToken: null,
      expiresAt: longLived.expires_in
        ? new Date(Date.now() + longLived.expires_in * 1000)
        : null,
      scopes: this.scopes,
      externalAccountId: metadata.externalAccountId,
      settings: metadata.settings,
    };
  }

  private async fetchInstagramMetadata(accessToken: string): Promise<{
    externalAccountId: string | null;
    settings: IntegrationSettings;
  }> {
    const response = await this.graphRequest<MetaAccountsResponse>(
      '/me/accounts',
      accessToken,
      {
        fields: 'id,name,instagram_business_account',
      },
    );

    const page = response.data?.find((item) => item.instagram_business_account?.id);

    if (!page?.instagram_business_account?.id) {
      throw new IntegrationOAuthExchangeFailedException(
        this.provider,
        'No Instagram business account linked to Meta pages',
      );
    }

    return {
      externalAccountId: page.instagram_business_account.id,
      settings: {
        instagramBusinessAccountId: page.instagram_business_account.id,
        facebookPageId: page.id,
        pageName: page.name,
      },
    };
  }

  private async exchangeForShortLivedToken(
    code: string,
  ): Promise<MetaTokenResponse> {
    return this.graphRequest<MetaTokenResponse>(META_TOKEN_URL, undefined, {
      client_id: this.appId,
      client_secret: this.appSecret,
      redirect_uri: this.redirectUri,
      code,
    });
  }

  private async exchangeForLongLivedToken(
    shortLivedToken: string,
  ): Promise<MetaTokenResponse> {
    return this.graphRequest<MetaTokenResponse>(META_TOKEN_URL, undefined, {
      grant_type: 'fb_exchange_token',
      client_id: this.appId,
      client_secret: this.appSecret,
      fb_exchange_token: shortLivedToken,
    });
  }

  private async graphRequest<T>(
    path: string,
    accessToken: string | undefined,
    params: Record<string, string>,
  ): Promise<T> {
    const url = path.startsWith('http')
      ? new URL(path)
      : new URL(`${META_GRAPH_URL}${path}`);

    for (const [key, value] of Object.entries(params)) {
      url.searchParams.set(key, value);
    }

    if (accessToken) {
      url.searchParams.set('access_token', accessToken);
    }

    const response = await fetch(url);

    if (!response.ok) {
      const body = await response.text();
      throw new IntegrationOAuthExchangeFailedException(
        this.provider,
        body || response.statusText,
      );
    }

    return (await response.json()) as T;
  }

  private require(key: string): string {
    const value = this.config.get<string>(key)?.trim();

    if (!value) {
      throw new IntegrationOAuthNotConfiguredException(this.provider, key);
    }

    return value;
  }

  private defaultRedirectUri(provider: IntegrationProviderEnum): string {
    const publicUrl = this.config
      .get<string>('API_PUBLIC_URL', 'http://localhost:3000')
      .replace(/\/$/, '');

    return `${publicUrl}/integrations/oauth/callback/${provider}`;
  }
}

@Injectable()
export class MetaWhatsAppOAuthClient implements IntegrationOAuthClient {
  readonly provider = IntegrationProviderEnum.WHATSAPP_CLOUD;

  private readonly appId: string;
  private readonly appSecret: string;
  private readonly redirectUri: string;
  private readonly scopes = [
    'whatsapp_business_management',
    'whatsapp_business_messaging',
    'business_management',
  ];

  constructor(private readonly config: ConfigService) {
    this.appId = this.require('META_INTEGRATION_APP_ID');
    this.appSecret = this.require('META_INTEGRATION_APP_SECRET');
    this.redirectUri =
      config.get<string>('META_WHATSAPP_INTEGRATION_REDIRECT_URI')?.trim() ||
      this.defaultRedirectUri(IntegrationProviderEnum.WHATSAPP_CLOUD);
  }

  buildAuthorizationUrl(state: string): string {
    const params = new URLSearchParams({
      client_id: this.appId,
      redirect_uri: this.redirectUri,
      response_type: 'code',
      scope: this.scopes.join(','),
      state,
    });

    return `${META_AUTH_BASE}?${params.toString()}`;
  }

  async exchangeCode(code: string): Promise<IntegrationOAuthConnection> {
    const shortLived = await this.exchangeForShortLivedToken(code);
    const longLived = await this.exchangeForLongLivedToken(shortLived.access_token!);
    const metadata = await this.fetchWhatsAppMetadata(longLived.access_token!);

    return {
      accessToken: longLived.access_token!,
      refreshToken: null,
      expiresAt: longLived.expires_in
        ? new Date(Date.now() + longLived.expires_in * 1000)
        : null,
      scopes: this.scopes,
      externalAccountId: metadata.externalAccountId,
      settings: metadata.settings,
    };
  }

  private async fetchWhatsAppMetadata(accessToken: string): Promise<{
    externalAccountId: string | null;
    settings: IntegrationSettings;
  }> {
    const businesses = await this.graphRequest<{ data?: Array<{ id: string }> }>(
      '/me/businesses',
      accessToken,
      { fields: 'id' },
    );
    const businessId = businesses.data?.[0]?.id;

    if (!businessId) {
      throw new IntegrationOAuthExchangeFailedException(
        this.provider,
        'No Meta business account found for WhatsApp Cloud integration',
      );
    }

    const wabaResponse = await this.graphRequest<MetaWhatsappAccountsResponse>(
      `/${businessId}/owned_whatsapp_business_accounts`,
      accessToken,
      {
        fields: 'id,name,phone_numbers{id,display_phone_number}',
      },
    );

    const waba = wabaResponse.data?.[0];
    const phoneNumber = waba?.phone_numbers?.data?.[0];

    if (!waba?.id || !phoneNumber?.id) {
      throw new IntegrationOAuthExchangeFailedException(
        this.provider,
        'No WhatsApp business phone number found',
      );
    }

    return {
      externalAccountId: phoneNumber.id,
      settings: {
        phoneNumberId: phoneNumber.id,
        wabaId: waba.id,
        displayPhoneNumber: phoneNumber.display_phone_number,
      },
    };
  }

  private async exchangeForShortLivedToken(
    code: string,
  ): Promise<MetaTokenResponse> {
    return this.graphRequest<MetaTokenResponse>(META_TOKEN_URL, undefined, {
      client_id: this.appId,
      client_secret: this.appSecret,
      redirect_uri: this.redirectUri,
      code,
    });
  }

  private async exchangeForLongLivedToken(
    shortLivedToken: string,
  ): Promise<MetaTokenResponse> {
    return this.graphRequest<MetaTokenResponse>(META_TOKEN_URL, undefined, {
      grant_type: 'fb_exchange_token',
      client_id: this.appId,
      client_secret: this.appSecret,
      fb_exchange_token: shortLivedToken,
    });
  }

  private async graphRequest<T>(
    path: string,
    accessToken: string | undefined,
    params: Record<string, string>,
  ): Promise<T> {
    const url = path.startsWith('http')
      ? new URL(path)
      : new URL(`${META_GRAPH_URL}${path}`);

    for (const [key, value] of Object.entries(params)) {
      url.searchParams.set(key, value);
    }

    if (accessToken) {
      url.searchParams.set('access_token', accessToken);
    }

    const response = await fetch(url);

    if (!response.ok) {
      const body = await response.text();
      throw new IntegrationOAuthExchangeFailedException(
        this.provider,
        body || response.statusText,
      );
    }

    return (await response.json()) as T;
  }

  private require(key: string): string {
    const value = this.config.get<string>(key)?.trim();

    if (!value) {
      throw new IntegrationOAuthNotConfiguredException(this.provider, key);
    }

    return value;
  }

  private defaultRedirectUri(provider: IntegrationProviderEnum): string {
    const publicUrl = this.config
      .get<string>('API_PUBLIC_URL', 'http://localhost:3000')
      .replace(/\/$/, '');

    return `${publicUrl}/integrations/oauth/callback/${provider}`;
  }
}
