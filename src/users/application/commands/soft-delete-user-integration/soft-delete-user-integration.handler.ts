import { Inject } from '@nestjs/common';
import { CommandHandler, type ICommandHandler } from '@common/application/cqrs';
import { getOwnedUserIntegration } from '@users/application/get-owned-user-integration';
import type { IUserIntegrationRepository } from '@users/domain/repositories';
import { USER_INTEGRATION_REPOSITORY } from '@users/domain/tokens';
import { SoftDeleteUserIntegrationCommand } from './soft-delete-user-integration.command';

@CommandHandler(SoftDeleteUserIntegrationCommand)
export class SoftDeleteUserIntegrationHandler implements ICommandHandler<
  SoftDeleteUserIntegrationCommand,
  void
> {
  constructor(
    @Inject(USER_INTEGRATION_REPOSITORY)
    private readonly userIntegrationRepository: IUserIntegrationRepository,
  ) {}

  async execute(command: SoftDeleteUserIntegrationCommand): Promise<void> {
    const { provider, userId } = command.payload;
    const integration = await getOwnedUserIntegration(
      this.userIntegrationRepository,
      userId,
      provider,
    );

    integration.softDelete();
    await this.userIntegrationRepository.save(integration);
  }
}
