import {
  Controller,
  Get,
  Param,
  Query,
  Res,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { CommandBus } from '@common/application/cqrs';
import { DomainException } from '@common/exceptions';
import type { Response } from 'express';
import { HandleIntegrationOAuthCallbackCommand } from '@users/application/commands/handle-integration-oauth-callback/handle-integration-oauth-callback.command';
import { IntegrationProviderEnum } from '@users/domain/enums';
import { IntegrationOAuthCallbackQueryDto } from '@users/presentation/dto/integration-oauth-callback.dto';

@Controller('integrations/oauth')
export class IntegrationOAuthController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly config: ConfigService,
  ) {}

  @Get('callback/:provider')
  async callback(
    @Param('provider') provider: IntegrationProviderEnum,
    @Query() query: IntegrationOAuthCallbackQueryDto,
    @Res({ passthrough: true }) response: Response,
  ) {
    const failureUrl = this.config.get<string>('INTEGRATION_OAUTH_FAILURE_URL');

    try {
      const result = await this.commandBus.execute(
        new HandleIntegrationOAuthCallbackCommand({
          provider,
          code: query.code,
          state: query.state,
          error: query.error,
          errorDescription: query.error_description,
        }),
      );

      const successUrl = this.config.get<string>('INTEGRATION_OAUTH_SUCCESS_URL');

      if (successUrl) {
        const redirectUrl = new URL(successUrl);
        redirectUrl.searchParams.set('provider', provider);
        redirectUrl.searchParams.set('status', 'connected');
        redirectUrl.searchParams.set('integrationId', result.id);
        response.redirect(redirectUrl.toString());
        return;
      }

      return result;
    } catch (error) {
      if (failureUrl) {
        const redirectUrl = new URL(failureUrl);
        redirectUrl.searchParams.set('provider', provider);
        redirectUrl.searchParams.set('status', 'failed');

        if (error instanceof DomainException) {
          redirectUrl.searchParams.set('code', error.code);
          redirectUrl.searchParams.set('message', error.message);
        }

        response.redirect(redirectUrl.toString());
        return;
      }

      throw error;
    }
  }
}
