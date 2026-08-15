import type { UserWorkingHours } from '@users/domain/aggregates';

export interface IUserWorkingHoursRepository {
  findById(id: string): Promise<UserWorkingHours | null>;
  findByUserIdAndDayOfWeek(
    userId: string,
    dayOfWeek: number,
  ): Promise<UserWorkingHours | null>;
  findByUserIdAndDayOfWeekIncludingDeleted(
    userId: string,
    dayOfWeek: number,
  ): Promise<UserWorkingHours | null>;
  listByUserId(userId: string): Promise<UserWorkingHours[]>;
  save(workingHours: UserWorkingHours): Promise<void>;
}
