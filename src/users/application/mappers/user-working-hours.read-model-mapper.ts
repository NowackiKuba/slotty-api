import { Injectable } from '@nestjs/common';
import { UserWorkingHours } from '@users/domain/aggregates';
import type { UserWorkingHoursReadModel } from '../read-models';

@Injectable()
export class UserWorkingHoursReadModelMapper {
  toReadModel(domain: UserWorkingHours): UserWorkingHoursReadModel {
    const snapshot = domain.toSnapshot();

    return {
      id: snapshot.id,
      userId: snapshot.userId,
      dayOfWeek: snapshot.dayOfWeek,
      startTime: snapshot.startTime,
      endTime: snapshot.endTime,
      isDayOff: snapshot.isDayOff,
      createdAt: snapshot.createdAt,
      updatedAt: snapshot.updatedAt,
    };
  }
}
