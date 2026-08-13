import { Inject } from '@nestjs/common';
import { CommandHandler, type ICommandHandler } from '@common/application/cqrs';
import { UserIntegrationReadModelMapper } from '@users/application/mappers';
import type { UserIntegrationReadModel } from '@users/application/read-models';
import { validateIntegrationSettings } from '@users/application/validate-integration-settings';
import { UserIntegration } from '@users/domain/aggregates';
import {
  IntegrationProviderEnum,
  isIntegrationProvider,
} from '@users/domain/enums';
import { InvalidIntegrationProviderException } from '@users/domain/exceptions/integration';
import { UserNotFoundException } from '@users/domain/exceptions/user';
import type {
  IUserIntegrationRepository,
  IUserRepository,
} from '@users/domain/repositories';
import {
  USER_INTEGRATION_REPOSITORY,
  USER_REPOSITORY,
} from '@users/domain/tokens';
import { UserId } from '@users/domain/value-objects';
import { ConnectUserIntegrationCommand } from './connect-user-integration.command';

@CommandHandler(ConnectUserIntegrationCommand)
export class ConnectUserIntegrationHandler implements ICommandHandler<
  ConnectUserIntegrationCommand,
  UserIntegrationReadModel
> {
  constructor(
    private readonly mapper: UserIntegrationReadModelMapper,
    @Inject(USER_REPOSITORY)
    private readonly userRepository: IUserRepository,
    @Inject(USER_INTEGRATION_REPOSITORY)
    private readonly userIntegrationRepository: IUserIntegrationRepository,
  ) {}

  async execute(
    command: ConnectUserIntegrationCommand,
  ): Promise<UserIntegrationReadModel> {
    const {
      accessToken,
      expiresAt,
      externalAccountId,
      provider,
      refreshToken,
      scopes,
      settings,
      userId,
    } = command.payload;

    const parsedProvider = parseProvider(provider);
    const user = await this.userRepository.findById(UserId.create(userId));

    if (!user) {
      throw new UserNotFoundException(userId);
    }

    const existing = await this.userIntegrationRepository.findByUserIdAndProvider(
      user.id,
      parsedProvider,
    );

    if (existing) {
      existing.updateTokens(
        accessToken,
        refreshToken ?? undefined,
        expiresAt ?? undefined,
      );

      if (externalAccountId !== undefined) {
        existing.changeExternalAccountId(externalAccountId);
      }

      if (scopes) {
        existing.changeScopes(scopes);
      }

      if (settings) {
        existing.updateSettings(
          validateIntegrationSettings(parsedProvider, settings),
        );
      }

      await this.userIntegrationRepository.save(existing);

      return this.mapper.toReadModel(existing);
    }

    const integration = UserIntegration.create({
      userId,
      provider: parsedProvider,
      externalAccountId: externalAccountId ?? undefined,
      accessToken,
      refreshToken: refreshToken ?? undefined,
      expiresAt: expiresAt ?? undefined,
      scopes,
      settings: settings
        ? validateIntegrationSettings(parsedProvider, settings)
        : undefined,
    });

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
