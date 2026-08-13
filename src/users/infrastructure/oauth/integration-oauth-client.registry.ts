import { Injectable } from '@nestjs/common';
import { IntegrationProviderEnum } from '@users/domain/enums';
import { IntegrationOAuthNotSupportedException } from '@users/domain/exceptions/integration';
import { GoogleCalendarOAuthClient } from './google-calendar-oauth.client';
import {
  MetaInstagramOAuthClient,
  MetaWhatsAppOAuthClient,
} from './meta-oauth.client';
import type { IntegrationOAuthClient } from './integration-oauth.types';

@Injectable()
export class IntegrationOAuthClientRegistry {
  private readonly clients: Map<IntegrationProviderEnum, IntegrationOAuthClient>;

  constructor(
    googleCalendarOAuthClient: GoogleCalendarOAuthClient,
    metaInstagramOAuthClient: MetaInstagramOAuthClient,
    metaWhatsAppOAuthClient: MetaWhatsAppOAuthClient,
  ) {
    this.clients = new Map<IntegrationProviderEnum, IntegrationOAuthClient>([
      [IntegrationProviderEnum.GOOGLE_CALENDAR, googleCalendarOAuthClient],
      [IntegrationProviderEnum.INSTAGRAM_DM, metaInstagramOAuthClient],
      [IntegrationProviderEnum.WHATSAPP_CLOUD, metaWhatsAppOAuthClient],
    ]);
  }

  get(provider: IntegrationProviderEnum): IntegrationOAuthClient {
    const client = this.clients.get(provider);

    if (!client) {
      throw new IntegrationOAuthNotSupportedException(provider);
    }

    return client;
  }
}
