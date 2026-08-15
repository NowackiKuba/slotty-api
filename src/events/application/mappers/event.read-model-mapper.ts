import { Injectable } from '@nestjs/common';
import { Event } from '@events/domain/aggregates';
import { EventReadModel } from '../read-models';

@Injectable()
export class EventReadModelMapper {
  toReadModel(domain: Event): EventReadModel {
    const snapshot = domain.toSnapshot();

    return {
      id: snapshot.id,
      userId: snapshot.userId,
      customerId: snapshot.customerId,
      status: snapshot.status,
      type: snapshot.type,
      isPaymentApplicableYet: snapshot.isPaymentApplicableYet,
      price: snapshot.price,
      paymentMethod: snapshot.paymentMethod,
      currency: snapshot.currency,
      location: snapshot.location,
      source: snapshot.source,
      isPaid: snapshot.isPaid,
      title: snapshot.title,
      description: snapshot.description,
      startDate: snapshot.startDate,
      endDate: snapshot.endDate,
      googleCalendarId: snapshot.googleCalendarId,
      googleEventId: snapshot.googleEventId,
      preSessionPlan: snapshot.preSessionPlan,
      postSessionNotes: snapshot.postSessionNotes,
      createdAt: snapshot.createdAt,
      updatedAt: snapshot.updatedAt,
    };
  }
}
