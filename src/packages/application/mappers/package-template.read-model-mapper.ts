import { Injectable } from '@nestjs/common';
import { PackageTemplate } from '@packages/domain/aggregates';
import type { PackageTemplateReadModel } from '../read-models';

@Injectable()
export class PackageTemplateReadModelMapper {
  toReadModel(domain: PackageTemplate): PackageTemplateReadModel {
    const snapshot = domain.toSnapshot();

    return {
      id: snapshot.id,
      userId: snapshot.userId,
      name: snapshot.name,
      description: snapshot.description,
      sessionCount: snapshot.sessionCount,
      price: snapshot.price,
      currency: snapshot.currency,
      validityDays: snapshot.validityDays,
      isActive: snapshot.isActive,
      createdAt: snapshot.createdAt,
      updatedAt: snapshot.updatedAt,
    };
  }
}
