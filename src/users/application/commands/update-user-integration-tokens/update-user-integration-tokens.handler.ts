import { Inject } from '@nestjs/common';
import { CommandHandler, type ICommandHandler } from '@common/application/cqrs';
import { getOwnedUserIntegration } from '@users/application/get-owned-user-integration';
import { UserIntegrationReadModelMapper } from '@users/application/mappers';
import type { UserIntegrationReadModel } from '@users/application/read-models';
import type { IUserIntegrationRepository } from '@users/domain/repositories';
import { USER_INTEGRATION_REPOSITORY } from '@users/domain/tokens';
import { UpdateUserIntegrationTokensCommand } from './update-user-integration-tokens.command';

@CommandHandler(UpdateUserIntegrationTokensCommand)
export class UpdateUserIntegrationTokensHandler implements ICommandHandler<
  UpdateUserIntegrationTokensCommand,
  UserIntegrationReadModel
> {
  constructor(
    private readonly mapper: UserIntegrationReadModelMapper,
    @Inject(USER_INTEGRATION_REPOSITORY)
    private readonly userIntegrationRepository: IUserIntegrationRepository,
  ) {}

  async execute(
    command: UpdateUserIntegrationTokensCommand,
  ): Promise<UserIntegrationReadModel> {
    const { accessToken, expiresAt, provider, refreshToken, userId } =
      command.payload;
    const integration = await getOwnedUserIntegration(
      this.userIntegrationRepository,
      userId,
      provider,
    );

    integration.updateTokens(
      accessToken,
      refreshToken ?? undefined,
      expiresAt ?? undefined,
    );
    await this.userIntegrationRepository.save(integration);

    return this.mapper.toReadModel(integration);
  }
}
