import { UserWorkingHours } from '@users/domain/aggregates';
import type { IUserWorkingHoursRepository } from '@users/domain/repositories';

export type UpsertUserWorkingHoursInput = {
  userId: string;
  dayOfWeek: number;
  startTime?: string;
  endTime?: string;
  isDayOff?: boolean;
};

export async function upsertUserWorkingHours(
  repository: IUserWorkingHoursRepository,
  input: UpsertUserWorkingHoursInput,
): Promise<UserWorkingHours> {
  const existing = await repository.findByUserIdAndDayOfWeekIncludingDeleted(
    input.userId,
    input.dayOfWeek,
  );

  if (!existing) {
    const created = UserWorkingHours.create(input);
    await repository.save(created);
    return created;
  }

  if (existing.isDeleted) {
    existing.restore();
  }

  existing.changeHours({
    startTime: input.startTime,
    endTime: input.endTime,
    isDayOff: input.isDayOff,
  });
  await repository.save(existing);

  return existing;
}
