import { Inject } from '@nestjs/common';
import { QueryHandler, type IQueryHandler } from '@common/application/cqrs';
import { getOwnedUserIntegration } from '@users/application/get-owned-user-integration';
import { UserIntegrationReadModelMapper } from '@users/application/mappers';
import type { UserIntegrationReadModel } from '@users/application/read-models';
import type { IUserIntegrationRepository } from '@users/domain/repositories';
import { USER_INTEGRATION_REPOSITORY } from '@users/domain/tokens';
import { GetUserIntegrationByProviderQuery } from './get-user-integration-by-provider.query';

@QueryHandler(GetUserIntegrationByProviderQuery)
export class GetUserIntegrationByProviderHandler implements IQueryHandler<
  GetUserIntegrationByProviderQuery,
  UserIntegrationReadModel
> {
  constructor(
    private readonly mapper: UserIntegrationReadModelMapper,
    @Inject(USER_INTEGRATION_REPOSITORY)
    private readonly userIntegrationRepository: IUserIntegrationRepository,
  ) {}

  async execute(
    query: GetUserIntegrationByProviderQuery,
  ): Promise<UserIntegrationReadModel> {
    const { provider, userId } = query.payload;
    const integration = await getOwnedUserIntegration(
      this.userIntegrationRepository,
      userId,
      provider,
    );

    return this.mapper.toReadModel(integration);
  }
}
