import { Injectable } from '@nestjs/common';
import { CustomerId } from '@customers/domain/value-objects';
import { CustomerMikroOrmEntity } from '@customers/infrastructure/persistence/entities';
import { Event } from '@events/domain/aggregates';
import { EventId, EventStatus } from '@events/domain/value-objects';
import { UserId } from '@users/domain/value-objects';
import { UserMikroOrmEntity } from '@users/infrastructure/persistence/entities';
import { EventMikroOrmEntity } from '../entities/event-mikro-orm.entity';

@Injectable()
export class EventPersistenceMapper {
  toDomain(entity: EventMikroOrmEntity): Event {
    return Event.reconstitute({
      id: EventId.create(entity.id),
      userId: UserId.create(entity.user.id),
      customerId: entity.customer
        ? CustomerId.create(entity.customer.id)
        : undefined,
      status: EventStatus.create(entity.status),
      type: entity.type,
      isPaymentApplicableYet: entity.isPaymentApplicableYet,
      price: entity.price,
      paymentMethod: entity.paymentMethod,
      currency: entity.currency,
      location: entity.location,
      source: entity.source,
      isPaid: entity.isPaid,
      title: entity.title,
      description: entity.description,
      startDate: entity.startDate,
      endDate: entity.endDate,
      googleCalendarId: entity.googleCalendarId,
      googleEventId: entity.googleEventId,
      preSessionPlan: entity.preSessionPlan,
      postSessionNotes: entity.postSessionNotes,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
      deletedAt: entity.deletedAt ?? null,
    });
  }

  toPersistence(
    event: Event,
    user: UserMikroOrmEntity,
    customer?: CustomerMikroOrmEntity | null,
  ): EventMikroOrmEntity {
    const snapshot = event.toSnapshot();

    return new EventMikroOrmEntity({
      id: snapshot.id,
      user,
      customer: snapshot.customerId ? (customer ?? null) : null,
      status: snapshot.status,
      type: snapshot.type,
      isPaymentApplicableYet: snapshot.isPaymentApplicableYet,
      price: snapshot.price,
      paymentMethod: snapshot.paymentMethod ?? undefined,
      currency: snapshot.currency,
      location: snapshot.location ?? undefined,
      source: snapshot.source,
      isPaid: snapshot.isPaid,
      title: snapshot.title,
      description: snapshot.description ?? undefined,
      startDate: snapshot.startDate,
      endDate: snapshot.endDate,
      googleCalendarId: snapshot.googleCalendarId ?? undefined,
      googleEventId: snapshot.googleEventId ?? undefined,
      preSessionPlan: snapshot.preSessionPlan ?? undefined,
      postSessionNotes: snapshot.postSessionNotes ?? undefined,
      createdAt: snapshot.createdAt,
      updatedAt: snapshot.updatedAt,
      deletedAt: snapshot.deletedAt,
    });
  }
}
