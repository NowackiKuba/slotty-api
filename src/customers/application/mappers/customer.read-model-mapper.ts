import { Customer } from '@customers/domain/aggregates';
import { Injectable } from '@nestjs/common';
import {
  CustomerReadModel,
  CustomerWithFullDetailsReadModel,
} from '../read-models';

@Injectable()
export class CustomerReadModelMapper {
  toReadModel(domain: Customer): CustomerReadModel {
    const snapshot = domain.toSnapshot();

    return {
      id: snapshot.id,
      userId: snapshot.userId,
      source: snapshot.source,
      firstName: snapshot.firstName,
      lastName: snapshot.lastName,
      nickname: snapshot.nickname,
      avatarUrl: snapshot.avatarUrl,
      equipmentToBring: snapshot.equipmentToBring,
      focusAreas: snapshot.focusAreas,
      healthNotes: snapshot.healthNotes,
      generalNotes: snapshot.generalNotes,
      status: snapshot.status,
      aiOptOut: snapshot.aiOptOut,
      preferredLanguage: snapshot.preferredLanguage,
      totalSessionsCount: snapshot.totalSessionsCount,
      noShowCount: snapshot.noShowCount,
      createdAt: snapshot.createdAt,
      updatedAt: snapshot.updatedAt,
    };
  }

  toReadModelWithFullDetails(
    domain: Customer,
  ): CustomerWithFullDetailsReadModel {
    const snapshot = domain.toSnapshot();

    return {
      ...this.toReadModel(domain),
      email: snapshot.email,
      phoneNumber: snapshot.phoneNumber,
      instagramAccountId: snapshot.instagramAccountId,
      whatsappAccountId: snapshot.whatsappAccountId,
    };
  }
}
