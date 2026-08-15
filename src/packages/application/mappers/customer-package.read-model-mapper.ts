import { Injectable } from '@nestjs/common';
import { CustomerPackage } from '@packages/domain/aggregates';
import type { CustomerPackageReadModel } from '../read-models';

@Injectable()
export class CustomerPackageReadModelMapper {
  toReadModel(domain: CustomerPackage): CustomerPackageReadModel {
    const snapshot = domain.toSnapshot();

    return {
      id: snapshot.id,
      userId: snapshot.userId,
      customerId: snapshot.customerId,
      packageTemplateId: snapshot.packageTemplateId,
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
    };
  }
}
