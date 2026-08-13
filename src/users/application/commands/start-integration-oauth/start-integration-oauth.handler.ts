import { CommandHandler, type ICommandHandler } from '@common/application/cqrs';
import {
  IntegrationProviderEnum,
  isIntegrationProvider,
} from '@users/domain/enums';
import { InvalidIntegrationProviderException } from '@users/domain/exceptions/integration';
import type { IntegrationOAuthStartReadModel } from '@users/application/read-models';
import {
  IntegrationOAuthClientRegistry,
  IntegrationOAuthStateStore,
} from '@users/infrastructure/oauth';
import { StartIntegrationOAuthCommand } from './start-integration-oauth.command';

@CommandHandler(StartIntegrationOAuthCommand)
export class StartIntegrationOAuthHandler implements ICommandHandler<
  StartIntegrationOAuthCommand,
  IntegrationOAuthStartReadModel
> {
  constructor(
    private readonly oauthClients: IntegrationOAuthClientRegistry,
    private readonly oauthStateStore: IntegrationOAuthStateStore,
  ) {}

  async execute(
    command: StartIntegrationOAuthCommand,
  ): Promise<IntegrationOAuthStartReadModel> {
    const provider = parseProvider(command.payload.provider);
    const state = await this.oauthStateStore.issue(
      command.payload.userId,
      provider,
    );
    const client = this.oauthClients.get(provider);

    return {
      provider,
      state,
      authorizationUrl: client.buildAuthorizationUrl(state),
    };
  }
}

function parseProvider(provider: string): IntegrationProviderEnum {
  const normalized = provider.trim().toUpperCase();

  if (!isIntegrationProvider(normalized)) {
    throw new InvalidIntegrationProviderException(provider);
  }

  return normalized;
}
