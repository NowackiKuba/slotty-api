import { Injectable } from '@nestjs/common';
import { UserProfile } from '@users/domain/aggregates';
import {
  isPaymentMethod,
  isSport,
  SettlementType,
  type PaymentMethod,
  type Sport,
} from '@users/domain/enums';
import {
  LocationPoint,
  PaymentDetails,
  SessionDuration,
  SessionPrice,
  UserId,
  UserProfileId,
} from '@users/domain/value-objects';
import { UserMikroOrmEntity } from '../entities/user-mikro-orm.entity';
import { UserProfileMikroOrmEntity } from '../entities/user-profile-mikro-orm.entity';

@Injectable()
export class UserProfilePersistenceMapper {
  toDomain(entity: UserProfileMikroOrmEntity): UserProfile {
    return UserProfile.reconstitute({
      id: UserProfileId.create(entity.id),
      userId: UserId.create(entity.user.id),
      sports: parseStoredSports(entity.sports),
      nickname: entity.nickname,
      bio: entity.bio,
      avatarUrl: entity.avatarUrl,
      places: entity.places.map((place) => LocationPoint.create(place)),
      withTravel: entity.withTravel ?? false,
      sessionPrice: SessionPrice.create(
        entity.pricePerSession,
        entity.currency,
      ),
      sessionDuration: SessionDuration.create(
        Number(entity.sessionDurationMinutes),
      ),
      courtFeeIncluded: entity.courtFeeIncluded,
      maxGroupSize: entity.maxGroupSize,
      cancellationWindowHours: entity.cancellationWindowHours,
      settlementType: entity.settlementType ?? SettlementType.PER_SESSION,
      paymentMethods: parseStoredPaymentMethods(entity.paymentMethods),
      paymentDetails: entity.paymentDetails
        ? PaymentDetails.create(entity.paymentDetails)
        : undefined,
      aiEnabled: entity.aiEnabled ?? false,
      autoConfirmBookings: entity.autoConfirmBookings,
      aiCustomInstructions: entity.aiCustomInstructions ?? [],
      googleCalendarId: entity.googleCalendarId ?? null,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
      deletedAt: entity.deletedAt ?? null,
    });
  }

  toPersistence(
    profile: UserProfile,
    user: UserMikroOrmEntity,
  ): UserProfileMikroOrmEntity {
    const snapshot = profile.toSnapshot();

    return new UserProfileMikroOrmEntity({
      id: snapshot.id,
      user,
      sports: snapshot.sports,
      nickname: snapshot.nickname ?? undefined,
      bio: snapshot.bio ?? undefined,
      avatarUrl: snapshot.avatarUrl ?? undefined,
      places: snapshot.places,
      withTravel: snapshot.withTravel,
      pricePerSession: snapshot.pricePerSession,
      currency: snapshot.currency,
      sessionDurationMinutes: snapshot.sessionDurationMinutes,
      courtFeeIncluded: snapshot.courtFeeIncluded,
      maxGroupSize: snapshot.maxGroupSize ?? undefined,
      cancellationWindowHours: snapshot.cancellationWindowHours ?? undefined,
      settlementType: snapshot.settlementType,
      paymentMethods: snapshot.paymentMethods,
      paymentDetails: snapshot.paymentDetails ?? undefined,
      aiEnabled: snapshot.aiEnabled,
      autoConfirmBookings: snapshot.autoConfirmBookings,
      aiCustomInstructions: snapshot.aiCustomInstructions,
      googleCalendarId: snapshot.googleCalendarId,
      createdAt: snapshot.createdAt,
      updatedAt: snapshot.updatedAt,
      deletedAt: snapshot.deletedAt,
    });
  }
}

function parseStoredSports(sports: string[]): Sport[] {
  return sports.filter(isSport);
}

function parseStoredPaymentMethods(methods?: string[]): PaymentMethod[] {
  return (methods ?? []).filter(isPaymentMethod);
}
