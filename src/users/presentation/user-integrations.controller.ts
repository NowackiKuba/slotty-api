import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { CommandBus, QueryBus } from '@common/application/cqrs';
import {
  CurrentUser,
  type CurrentUserPayload,
} from '@auth/presentation/decorators/current-user.decorator';
import { JwtAuthGuard } from '@auth/presentation/guards/jwt-auth.guard';
import { ConnectUserIntegrationCommand } from '@users/application/commands/connect-user-integration/connect-user-integration.command';
import { DisconnectUserIntegrationCommand } from '@users/application/commands/disconnect-user-integration/disconnect-user-integration.command';
import { MarkUserIntegrationErrorCommand } from '@users/application/commands/mark-user-integration-error/mark-user-integration-error.command';
import { MarkUserIntegrationExpiredCommand } from '@users/application/commands/mark-user-integration-expired/mark-user-integration-expired.command';
import { RecordUserIntegrationSyncCommand } from '@users/application/commands/record-user-integration-sync/record-user-integration-sync.command';
import { RestoreUserIntegrationCommand } from '@users/application/commands/restore-user-integration/restore-user-integration.command';
import { RevokeUserIntegrationCommand } from '@users/application/commands/revoke-user-integration/revoke-user-integration.command';
import { SoftDeleteUserIntegrationCommand } from '@users/application/commands/soft-delete-user-integration/soft-delete-user-integration.command';
import { StartIntegrationOAuthCommand } from '@users/application/commands/start-integration-oauth/start-integration-oauth.command';
import { UpdateUserIntegrationSettingsCommand } from '@users/application/commands/update-user-integration-settings/update-user-integration-settings.command';
import { UpdateUserIntegrationTokensCommand } from '@users/application/commands/update-user-integration-tokens/update-user-integration-tokens.command';
import { GetUserIntegrationByProviderQuery } from '@users/application/queries/get-user-integration-by-provider/get-user-integration-by-provider.query';
import { ListUserIntegrationsQuery } from '@users/application/queries/list-user-integrations/list-user-integrations.query';
import { IntegrationProviderEnum } from '@users/domain/enums';
import {
  ConnectUserIntegrationDto,
  MarkUserIntegrationErrorDto,
  UpdateUserIntegrationSettingsDto,
  UpdateUserIntegrationTokensDto,
} from './dto/user-integrations.dto';

@Controller('users')
@UseGuards(JwtAuthGuard)
export class UserIntegrationsController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @Get('me/integrations/:provider/oauth/start')
  startOAuth(
    @CurrentUser() user: CurrentUserPayload,
    @Param('provider') provider: IntegrationProviderEnum,
  ) {
    return this.commandBus.execute(
      new StartIntegrationOAuthCommand({
        userId: user.userId,
        provider,
      }),
    );
  }

  @Get('me/integrations')
  list(@CurrentUser() user: CurrentUserPayload) {
    return this.queryBus.execute(
      new ListUserIntegrationsQuery({ userId: user.userId }),
    );
  }

  @Get('me/integrations/:provider')
  getByProvider(
    @CurrentUser() user: CurrentUserPayload,
    @Param('provider') provider: IntegrationProviderEnum,
  ) {
    return this.queryBus.execute(
      new GetUserIntegrationByProviderQuery({
        userId: user.userId,
        provider,
      }),
    );
  }

  @Post('me/integrations')
  @HttpCode(HttpStatus.CREATED)
  connect(
    @CurrentUser() user: CurrentUserPayload,
    @Body() body: ConnectUserIntegrationDto,
  ) {
    return this.commandBus.execute(
      new ConnectUserIntegrationCommand({
        userId: user.userId,
        provider: body.provider,
        externalAccountId: body.externalAccountId ?? null,
        accessToken: body.accessToken,
        refreshToken: body.refreshToken ?? null,
        expiresAt: body.expiresAt ?? null,
        scopes: body.scopes,
        settings: body.settings,
      }),
    );
  }

  @Patch('me/integrations/:provider/settings')
  updateSettings(
    @CurrentUser() user: CurrentUserPayload,
    @Param('provider') provider: IntegrationProviderEnum,
    @Body() body: UpdateUserIntegrationSettingsDto,
  ) {
    return this.commandBus.execute(
      new UpdateUserIntegrationSettingsCommand({
        userId: user.userId,
        provider,
        settings: body.settings,
      }),
    );
  }

  @Patch('me/integrations/:provider/tokens')
  updateTokens(
    @CurrentUser() user: CurrentUserPayload,
    @Param('provider') provider: IntegrationProviderEnum,
    @Body() body: UpdateUserIntegrationTokensDto,
  ) {
    return this.commandBus.execute(
      new UpdateUserIntegrationTokensCommand({
        userId: user.userId,
        provider,
        accessToken: body.accessToken,
        refreshToken: body.refreshToken ?? null,
        expiresAt: body.expiresAt ?? null,
      }),
    );
  }

  @Post('me/integrations/:provider/sync')
  recordSync(
    @CurrentUser() user: CurrentUserPayload,
    @Param('provider') provider: IntegrationProviderEnum,
  ) {
    return this.commandBus.execute(
      new RecordUserIntegrationSyncCommand({
        userId: user.userId,
        provider,
      }),
    );
  }

  @Post('me/integrations/:provider/mark-expired')
  markExpired(
    @CurrentUser() user: CurrentUserPayload,
    @Param('provider') provider: IntegrationProviderEnum,
  ) {
    return this.commandBus.execute(
      new MarkUserIntegrationExpiredCommand({
        userId: user.userId,
        provider,
      }),
    );
  }

  @Post('me/integrations/:provider/mark-error')
  markError(
    @CurrentUser() user: CurrentUserPayload,
    @Param('provider') provider: IntegrationProviderEnum,
    @Body() body: MarkUserIntegrationErrorDto,
  ) {
    return this.commandBus.execute(
      new MarkUserIntegrationErrorCommand({
        userId: user.userId,
        provider,
        message: body.message,
      }),
    );
  }

  @Post('me/integrations/:provider/disconnect')
  disconnect(
    @CurrentUser() user: CurrentUserPayload,
    @Param('provider') provider: IntegrationProviderEnum,
  ) {
    return this.commandBus.execute(
      new DisconnectUserIntegrationCommand({
        userId: user.userId,
        provider,
      }),
    );
  }

  @Post('me/integrations/:provider/revoke')
  revoke(
    @CurrentUser() user: CurrentUserPayload,
    @Param('provider') provider: IntegrationProviderEnum,
  ) {
    return this.commandBus.execute(
      new RevokeUserIntegrationCommand({
        userId: user.userId,
        provider,
      }),
    );
  }

  @Delete('me/integrations/:provider')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(
    @CurrentUser() user: CurrentUserPayload,
    @Param('provider') provider: IntegrationProviderEnum,
  ) {
    return this.commandBus.execute(
      new SoftDeleteUserIntegrationCommand({
        userId: user.userId,
        provider,
      }),
    );
  }

  @Post('me/integrations/:provider/restore')
  restore(
    @CurrentUser() user: CurrentUserPayload,
    @Param('provider') provider: IntegrationProviderEnum,
  ) {
    return this.commandBus.execute(
      new RestoreUserIntegrationCommand({
        userId: user.userId,
        provider,
      }),
    );
  }
}
