import { Injectable } from '@nestjs/common';
import { Customer } from '@customers/domain/aggregates';
import { CustomerId, CustomerStatus } from '@customers/domain/value-objects';
import { UserId } from '@users/domain/value-objects';
import { UserMikroOrmEntity } from '@users/infrastructure/persistence/entities';
import { CustomerMikroOrmEntity } from '../entities/customer-mikro-orm.entity';

@Injectable()
export class CustomerPersistenceMapper {
  toDomain(entity: CustomerMikroOrmEntity): Customer {
    return Customer.reconstitute({
      id: CustomerId.create(entity.id),
      userId: UserId.create(entity.user.id),
      source: entity.source,
      firstName: entity.firstName,
      lastName: entity.lastName,
      nickname: entity.nickname,
      email: entity.email,
      phoneNumber: entity.phoneNumber,
      avatarUrl: entity.avatarUrl,
      instagramAccountId: entity.instagramAccountId,
      whatsappAccountId: entity.whatsappAccountId,
      equipmentToBring: entity.equipmentToBring ?? [],
      focusAreas: entity.focusAreas ?? [],
      healthNotes: entity.healthNotes,
      generalNotes: entity.generalNotes,
      status: CustomerStatus.create(entity.status),
      aiOptOut: entity.aiOptOut ?? false,
      preferredLanguage: entity.preferredLanguage ?? 'pl',
      totalSessionsCount: entity.totalSessionsCount ?? 0,
      noShowCount: entity.noShowCount ?? 0,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
      deletedAt: entity.deletedAt ?? null,
    });
  }

  toPersistence(
    customer: Customer,
    user: UserMikroOrmEntity,
  ): CustomerMikroOrmEntity {
    const snapshot = customer.toSnapshot();

    return new CustomerMikroOrmEntity({
      id: snapshot.id,
      user,
      source: snapshot.source,
      firstName: snapshot.firstName,
      lastName: snapshot.lastName ?? undefined,
      nickname: snapshot.nickname ?? undefined,
      email: snapshot.email ?? undefined,
      phoneNumber: snapshot.phoneNumber ?? undefined,
      avatarUrl: snapshot.avatarUrl ?? undefined,
      instagramAccountId: snapshot.instagramAccountId ?? undefined,
      whatsappAccountId: snapshot.whatsappAccountId ?? undefined,
      equipmentToBring: snapshot.equipmentToBring,
      focusAreas: snapshot.focusAreas,
      healthNotes: snapshot.healthNotes ?? undefined,
      generalNotes: snapshot.generalNotes ?? undefined,
      status: snapshot.status,
      aiOptOut: snapshot.aiOptOut,
      preferredLanguage: snapshot.preferredLanguage,
      totalSessionsCount: snapshot.totalSessionsCount,
      noShowCount: snapshot.noShowCount,
      createdAt: snapshot.createdAt,
      updatedAt: snapshot.updatedAt,
      deletedAt: snapshot.deletedAt,
    });
  }
}
