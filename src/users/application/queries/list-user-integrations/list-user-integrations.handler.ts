import { Inject } from '@nestjs/common';
import { QueryHandler, type IQueryHandler } from '@common/application/cqrs';
import { UserIntegrationReadModelMapper } from '@users/application/mappers';
import type { UserIntegrationReadModel } from '@users/application/read-models';
import type { IUserIntegrationRepository } from '@users/domain/repositories';
import { USER_INTEGRATION_REPOSITORY } from '@users/domain/tokens';
import { UserId } from '@users/domain/value-objects';
import { ListUserIntegrationsQuery } from './list-user-integrations.query';

@QueryHandler(ListUserIntegrationsQuery)
export class ListUserIntegrationsHandler implements IQueryHandler<
  ListUserIntegrationsQuery,
  UserIntegrationReadModel[]
> {
  constructor(
    private readonly mapper: UserIntegrationReadModelMapper,
    @Inject(USER_INTEGRATION_REPOSITORY)
    private readonly userIntegrationRepository: IUserIntegrationRepository,
  ) {}

  async execute(
    query: ListUserIntegrationsQuery,
  ): Promise<UserIntegrationReadModel[]> {
    const integrations = await this.userIntegrationRepository.listByUserId(
      UserId.create(query.payload.userId),
    );

    return integrations.map((integration) =>
      this.mapper.toReadModel(integration),
    );
  }
}
