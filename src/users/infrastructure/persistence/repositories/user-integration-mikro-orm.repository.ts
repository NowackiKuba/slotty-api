import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@mikro-orm/nestjs';
import { EntityManager, EntityRepository } from '@mikro-orm/postgresql';
import { SOFT_DELETE_FILTER } from '@database/base.entity';
import { UserIntegration } from '@users/domain/aggregates';
import { IntegrationProviderEnum } from '@users/domain/enums';
import { IUserIntegrationRepository } from '@users/domain/repositories';
import { UserId, UserIntegrationId } from '@users/domain/value-objects';
import { UserMikroOrmEntity } from '../entities/user-mikro-orm.entity';
import { UserIntegrationMikroOrmEntity } from '../entities/user-integration-mikro-orm.entity';
import { UserIntegrationPersistenceMapper } from '../mappers/user-integration.persistence-mapper';

@Injectable()
export class UserIntegrationMikroOrmRepository
  implements IUserIntegrationRepository
{
  constructor(
    private readonly mapper: UserIntegrationPersistenceMapper,
    private readonly em: EntityManager,
    @InjectRepository(UserIntegrationMikroOrmEntity)
    private readonly repository: EntityRepository<UserIntegrationMikroOrmEntity>,
  ) {}

  async findById(id: UserIntegrationId): Promise<UserIntegration | null> {
    const integration = await this.repository.findOne(
      { id: id.value },
      { populate: ['user'] },
    );

    return integration ? this.mapper.toDomain(integration) : null;
  }

  async findByIdIncludingDeleted(
    id: UserIntegrationId,
  ): Promise<UserIntegration | null> {
    const integration = await this.repository.findOne(
      { id: id.value },
      {
        populate: ['user'],
        filters: { [SOFT_DELETE_FILTER]: false },
      },
    );

    return integration ? this.mapper.toDomain(integration) : null;
  }

  async findByUserIdAndProvider(
    userId: UserId,
    provider: IntegrationProviderEnum,
  ): Promise<UserIntegration | null> {
    const integration = await this.repository.findOne(
      { user: userId.value, provider },
      { populate: ['user'] },
    );

    return integration ? this.mapper.toDomain(integration) : null;
  }

  async listByUserId(userId: UserId): Promise<UserIntegration[]> {
    const integrations = await this.repository.find(
      { user: userId.value },
      { populate: ['user'], orderBy: { provider: 'ASC' } },
    );

    return integrations.map((integration) => this.mapper.toDomain(integration));
  }

  async findByUserIdAndProviderIncludingDeleted(
    userId: UserId,
    provider: IntegrationProviderEnum,
  ): Promise<UserIntegration | null> {
    const integration = await this.repository.findOne(
      { user: userId.value, provider },
      {
        populate: ['user'],
        filters: { [SOFT_DELETE_FILTER]: false },
      },
    );

    return integration ? this.mapper.toDomain(integration) : null;
  }

  async save(integration: UserIntegration): Promise<void> {
    const user = this.em.getReference(
      UserMikroOrmEntity,
      integration.userId.value,
    );
    const entity = this.mapper.toPersistence(integration, user);

    await this.repository.upsert(entity);
  }
}
