import { Inject } from '@nestjs/common';
import { CommandHandler, type ICommandHandler } from '@common/application/cqrs';
import { getOwnedUserIntegration } from '@users/application/get-owned-user-integration';
import { validateIntegrationSettings } from '@users/application/validate-integration-settings';
import { UserIntegrationReadModelMapper } from '@users/application/mappers';
import type { UserIntegrationReadModel } from '@users/application/read-models';
import {
  IntegrationProviderEnum,
  isIntegrationProvider,
} from '@users/domain/enums';
import { InvalidIntegrationProviderException } from '@users/domain/exceptions/integration';
import type { IUserIntegrationRepository } from '@users/domain/repositories';
import { USER_INTEGRATION_REPOSITORY } from '@users/domain/tokens';
import { UpdateUserIntegrationSettingsCommand } from './update-user-integration-settings.command';

@CommandHandler(UpdateUserIntegrationSettingsCommand)
export class UpdateUserIntegrationSettingsHandler implements ICommandHandler<
  UpdateUserIntegrationSettingsCommand,
  UserIntegrationReadModel
> {
  constructor(
    private readonly mapper: UserIntegrationReadModelMapper,
    @Inject(USER_INTEGRATION_REPOSITORY)
    private readonly userIntegrationRepository: IUserIntegrationRepository,
  ) {}

  async execute(
    command: UpdateUserIntegrationSettingsCommand,
  ): Promise<UserIntegrationReadModel> {
    const { provider, settings, userId } = command.payload;
    const integration = await getOwnedUserIntegration(
      this.userIntegrationRepository,
      userId,
      provider,
    );
    const parsedProvider = parseProvider(provider);
    const validatedSettings = validateIntegrationSettings(
      parsedProvider,
      settings,
    );

    integration.updateSettings(validatedSettings);
    await this.userIntegrationRepository.save(integration);

    return this.mapper.toReadModel(integration);
  }
}

function parseProvider(provider: string): IntegrationProviderEnum {
  const normalized = provider.trim().toUpperCase();

  if (!isIntegrationProvider(normalized)) {
    throw new InvalidIntegrationProviderException(provider);
  }

  return normalized;
}
