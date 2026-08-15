import { Injectable } from '@nestjs/common';
import { UserWorkingHours } from '@users/domain/aggregates';
import { UserMikroOrmEntity } from '../entities/user-mikro-orm.entity';
import { UserWorkingHoursMikroOrmEntity } from '../entities/user-working-hours-mikro-orm.entity';

@Injectable()
export class UserWorkingHoursPersistenceMapper {
  toDomain(entity: UserWorkingHoursMikroOrmEntity): UserWorkingHours {
    return UserWorkingHours.reconstitute({
      id: entity.id,
      userId: entity.user.id,
      dayOfWeek: entity.dayOfWeek,
      startTime: entity.startTime,
      endTime: entity.endTime,
      isDayOff: entity.isDayOff,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
      deletedAt: entity.deletedAt ?? null,
    });
  }

  toPersistence(
    workingHours: UserWorkingHours,
    user: UserMikroOrmEntity,
  ): UserWorkingHoursMikroOrmEntity {
    const snapshot = workingHours.toSnapshot();

    return new UserWorkingHoursMikroOrmEntity({
      id: snapshot.id,
      user,
      dayOfWeek: snapshot.dayOfWeek,
      startTime: snapshot.startTime,
      endTime: snapshot.endTime,
      isDayOff: snapshot.isDayOff,
      createdAt: snapshot.createdAt,
      updatedAt: snapshot.updatedAt,
      deletedAt: snapshot.deletedAt,
    });
  }
}
