import { Inject } from '@nestjs/common';
import { CommandHandler, type ICommandHandler } from '@common/application/cqrs';
import { getOwnedUserIntegration } from '@users/application/get-owned-user-integration';
import { UserIntegrationReadModelMapper } from '@users/application/mappers';
import type { UserIntegrationReadModel } from '@users/application/read-models';
import type { IUserIntegrationRepository } from '@users/domain/repositories';
import { USER_INTEGRATION_REPOSITORY } from '@users/domain/tokens';
import { DisconnectUserIntegrationCommand } from './disconnect-user-integration.command';

@CommandHandler(DisconnectUserIntegrationCommand)
export class DisconnectUserIntegrationHandler implements ICommandHandler<
  DisconnectUserIntegrationCommand,
  UserIntegrationReadModel
> {
  constructor(
    private readonly mapper: UserIntegrationReadModelMapper,
    @Inject(USER_INTEGRATION_REPOSITORY)
    private readonly userIntegrationRepository: IUserIntegrationRepository,
  ) {}

  async execute(
    command: DisconnectUserIntegrationCommand,
  ): Promise<UserIntegrationReadModel> {
    const { provider, userId } = command.payload;
    const integration = await getOwnedUserIntegration(
      this.userIntegrationRepository,
      userId,
      provider,
    );

    integration.disconnect();
    await this.userIntegrationRepository.save(integration);

    return this.mapper.toReadModel(integration);
  }
}
