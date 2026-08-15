import { Injectable } from '@nestjs/common';
import { CustomerMikroOrmEntity } from '@customers/infrastructure/persistence/entities';
import { CustomerPackage } from '@packages/domain/aggregates';
import { UserMikroOrmEntity } from '@users/infrastructure/persistence/entities';
import {
  CustomerPackageMikroOrmEntity,
  PackageTemplateMikroOrmEntity,
} from '../entities';

@Injectable()
export class CustomerPackagePersistenceMapper {
  toDomain(entity: CustomerPackageMikroOrmEntity): CustomerPackage {
    return CustomerPackage.reconstitute({
      id: entity.id,
      userId: entity.user.id,
      customerId: entity.customer.id,
      packageTemplateId: entity.packageTemplate?.id ?? null,
      name: entity.name,
      totalSessions: entity.totalSessions,
      remainingSessions: entity.remainingSessions,
      pricePaid: entity.pricePaid,
      currency: entity.currency,
      isPaid: entity.isPaid,
      status: entity.status,
      expiresAt: entity.expiresAt ?? null,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
      deletedAt: entity.deletedAt ?? null,
    });
  }

  toPersistence(
    customerPackage: CustomerPackage,
    user: UserMikroOrmEntity,
    customer: CustomerMikroOrmEntity,
    packageTemplate?: PackageTemplateMikroOrmEntity | null,
  ): CustomerPackageMikroOrmEntity {
    const snapshot = customerPackage.toSnapshot();

    return new CustomerPackageMikroOrmEntity({
      id: snapshot.id,
      user,
      customer,
      packageTemplate: snapshot.packageTemplateId
        ? (packageTemplate ?? null)
        : null,
      name: snapshot.name,
      totalSessions: snapshot.totalSessions,
      remainingSessions: snapshot.remainingSessions,
      pricePaid: snapshot.pricePaid,
      currency: snapshot.currency,
      isPaid: snapshot.isPaid,
      status: snapshot.status,
      expiresAt: snapshot.expiresAt,
      createdAt: snapshot.createdAt,
      updatedAt: snapshot.updatedAt,
      deletedAt: snapshot.deletedAt,
    });
  }
}
