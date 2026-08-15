import { Injectable } from '@nestjs/common';
import { PackageTemplate } from '@packages/domain/aggregates';
import { UserMikroOrmEntity } from '@users/infrastructure/persistence/entities';
import { PackageTemplateMikroOrmEntity } from '../entities';

@Injectable()
export class PackageTemplatePersistenceMapper {
  toDomain(entity: PackageTemplateMikroOrmEntity): PackageTemplate {
    return PackageTemplate.reconstitute({
      id: entity.id,
      userId: entity.user.id,
      name: entity.name,
      description: entity.description ?? null,
      sessionCount: entity.sessionCount,
      price: entity.price,
      currency: entity.currency,
      validityDays: entity.validityDays ?? null,
      isActive: entity.isActive,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
      deletedAt: entity.deletedAt ?? null,
    });
  }

  toPersistence(
    template: PackageTemplate,
    user: UserMikroOrmEntity,
  ): PackageTemplateMikroOrmEntity {
    const snapshot = template.toSnapshot();

    return new PackageTemplateMikroOrmEntity({
      id: snapshot.id,
      user,
      name: snapshot.name,
      description: snapshot.description ?? undefined,
      sessionCount: snapshot.sessionCount,
      price: snapshot.price,
      currency: snapshot.currency,
      validityDays: snapshot.validityDays ?? undefined,
      isActive: snapshot.isActive,
      createdAt: snapshot.createdAt,
      updatedAt: snapshot.updatedAt,
      deletedAt: snapshot.deletedAt,
    });
  }
}
