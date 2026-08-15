import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@mikro-orm/nestjs';
import { EntityManager, EntityRepository } from '@mikro-orm/postgresql';
import { SOFT_DELETE_FILTER } from '@database/base.entity';
import { PackageTemplate } from '@packages/domain/aggregates';
import { IPackageTemplateRepository } from '@packages/domain/repositories';
import { UserMikroOrmEntity } from '@users/infrastructure/persistence/entities';
import { PackageTemplateMikroOrmEntity } from '../entities';
import { PackageTemplatePersistenceMapper } from '../mappers';

@Injectable()
export class PackageTemplateMikroOrmRepository implements IPackageTemplateRepository {
  constructor(
    private readonly mapper: PackageTemplatePersistenceMapper,
    private readonly em: EntityManager,
    @InjectRepository(PackageTemplateMikroOrmEntity)
    private readonly repository: EntityRepository<PackageTemplateMikroOrmEntity>,
  ) {}

  async findById(id: string): Promise<PackageTemplate | null> {
    const template = await this.repository.findOne(
      { id },
      { populate: ['user'] },
    );

    return template ? this.mapper.toDomain(template) : null;
  }

  async findByIdIncludingDeleted(id: string): Promise<PackageTemplate | null> {
    const template = await this.repository.findOne(
      { id },
      {
        populate: ['user'],
        filters: { [SOFT_DELETE_FILTER]: false },
      },
    );

    return template ? this.mapper.toDomain(template) : null;
  }

  async listByUserId(userId: string): Promise<PackageTemplate[]> {
    const templates = await this.repository.find(
      { user: userId },
      { populate: ['user'], orderBy: { createdAt: 'DESC' } },
    );

    return templates.map((template) => this.mapper.toDomain(template));
  }

  async save(template: PackageTemplate): Promise<void> {
    const user = this.em.getReference(
      UserMikroOrmEntity,
      template.userId.value,
    );
    const entity = this.mapper.toPersistence(template, user);

    await this.repository.upsert(entity);
  }
}
