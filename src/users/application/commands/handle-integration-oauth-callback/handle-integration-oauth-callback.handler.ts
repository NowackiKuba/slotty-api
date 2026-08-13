import { CommandBus, CommandHandler, type ICommandHandler } from '@common/application/cqrs';
import type { UserIntegrationReadModel } from '@users/application/read-models';
import { ConnectUserIntegrationCommand } from '@users/application/commands/connect-user-integration/connect-user-integration.command';
import {
  IntegrationProviderEnum,
  isIntegrationProvider,
} from '@users/domain/enums';
import {
  IntegrationOAuthExchangeFailedException,
  InvalidIntegrationProviderException,
  InvalidIntegrationOAuthStateException,
} from '@users/domain/exceptions/integration';
import {
  IntegrationOAuthClientRegistry,
  IntegrationOAuthStateStore,
} from '@users/infrastructure/oauth';
import { HandleIntegrationOAuthCallbackCommand } from './handle-integration-oauth-callback.command';

@CommandHandler(HandleIntegrationOAuthCallbackCommand)
export class HandleIntegrationOAuthCallbackHandler implements ICommandHandler<
  HandleIntegrationOAuthCallbackCommand,
  UserIntegrationReadModel
> {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly oauthClients: IntegrationOAuthClientRegistry,
    private readonly oauthStateStore: IntegrationOAuthStateStore,
  ) {}

  async execute(
    command: HandleIntegrationOAuthCallbackCommand,
  ): Promise<UserIntegrationReadModel> {
    const { code, error, errorDescription, provider, state } = command.payload;
    const parsedProvider = parseProvider(provider);

    if (error) {
      throw new IntegrationOAuthExchangeFailedException(
        parsedProvider,
        errorDescription ?? error,
      );
    }

    if (!code || !state) {
      throw new InvalidIntegrationOAuthStateException();
    }

    const storedState = await this.oauthStateStore.consume(state);

    if (storedState.provider !== parsedProvider) {
      throw new InvalidIntegrationOAuthStateException();
    }

    const oauthClient = this.oauthClients.get(parsedProvider);
    const connection = await oauthClient.exchangeCode(code);

    return this.commandBus.execute(
      new ConnectUserIntegrationCommand({
        userId: storedState.userId,
        provider: parsedProvider,
        externalAccountId: connection.externalAccountId,
        accessToken: connection.accessToken,
        refreshToken: connection.refreshToken ?? null,
        expiresAt: connection.expiresAt ?? null,
        scopes: connection.scopes,
        settings: connection.settings,
      }),
    );
  }
}

function parseProvider(provider: string): IntegrationProviderEnum {
  const normalized = provider.trim().toUpperCase();

  if (!isIntegrationProvider(normalized)) {
    throw new InvalidIntegrationProviderException(provider);
  }

  return normalized;
}
