import { Injectable } from '@nestjs/common';
import { UserProfile } from '@users/domain/aggregates';
import type { UserProfileReadModel } from '../read-models';

@Injectable()
export class UserProfileReadModelMapper {
  toReadModel(domain: UserProfile): UserProfileReadModel {
    const snapshot = domain.toSnapshot();

    return {
      id: snapshot.id,
      userId: snapshot.userId,
      sports: snapshot.sports,
      nickname: snapshot.nickname,
      bio: snapshot.bio,
      avatarUrl: snapshot.avatarUrl,
      places: snapshot.places,
      withTravel: snapshot.withTravel,
      pricePerSession: snapshot.pricePerSession,
      currency: snapshot.currency,
      sessionDurationMinutes: snapshot.sessionDurationMinutes,
      courtFeeIncluded: snapshot.courtFeeIncluded,
      maxGroupSize: snapshot.maxGroupSize,
      cancellationWindowHours: snapshot.cancellationWindowHours,
      paymentMethods: snapshot.paymentMethods,
      paymentDetails: snapshot.paymentDetails,
      aiEnabled: snapshot.aiEnabled,
      autoConfirmBookings: snapshot.autoConfirmBookings,
      aiCustomInstructions: snapshot.aiCustomInstructions,
      googleCalendarId: snapshot.googleCalendarId,
      createdAt: snapshot.createdAt,
      updatedAt: snapshot.updatedAt,
    };
  }
}
