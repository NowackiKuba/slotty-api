import { Inject } from '@nestjs/common';
import { CommandHandler, type ICommandHandler } from '@common/application/cqrs';
import { UserWorkingHoursReadModelMapper } from '@users/application/mappers';
import type { UserWorkingHoursReadModel } from '@users/application/read-models';
import { upsertUserWorkingHours } from '@users/application/upsert-user-working-hours';
import { UserWorkingHours } from '@users/domain/aggregates';
import { UserNotFoundException } from '@users/domain/exceptions/user';
import { InvalidUserWorkingHoursException } from '@users/domain/exceptions/working-hours';
import type {
  IUserRepository,
  IUserWorkingHoursRepository,
} from '@users/domain/repositories';
import {
  USER_REPOSITORY,
  USER_WORKING_HOURS_REPOSITORY,
} from '@users/domain/tokens';
import { UserId } from '@users/domain/value-objects';
import { SetUserWorkingHoursWeekCommand } from './set-user-working-hours-week.command';

@CommandHandler(SetUserWorkingHoursWeekCommand)
export class SetUserWorkingHoursWeekHandler implements ICommandHandler<
  SetUserWorkingHoursWeekCommand,
  UserWorkingHoursReadModel[]
> {
  constructor(
    private readonly mapper: UserWorkingHoursReadModelMapper,
    @Inject(USER_REPOSITORY)
    private readonly userRepository: IUserRepository,
    @Inject(USER_WORKING_HOURS_REPOSITORY)
    private readonly workingHoursRepository: IUserWorkingHoursRepository,
  ) {}

  async execute(
    command: SetUserWorkingHoursWeekCommand,
  ): Promise<UserWorkingHoursReadModel[]> {
    const { userId, days } = command.payload;
    assertFullWeek(days);

    const user = await this.userRepository.findById(UserId.create(userId));

    if (!user) {
      throw new UserNotFoundException(userId);
    }

    days.forEach((day) => {
      UserWorkingHours.create({ userId, ...day });
    });

    const workingHours: UserWorkingHours[] = [];

    for (const day of [...days].sort((a, b) => a.dayOfWeek - b.dayOfWeek)) {
      workingHours.push(
        await upsertUserWorkingHours(this.workingHoursRepository, {
          userId,
          ...day,
        }),
      );
    }

    return workingHours.map((row) => this.mapper.toReadModel(row));
  }
}

function assertFullWeek(
  days: SetUserWorkingHoursWeekCommand['payload']['days'],
): void {
  if (days.length !== 7) {
    throw new InvalidUserWorkingHoursException(
      'working hours week must include exactly 7 days',
      { count: days.length },
    );
  }

  const uniqueDays = new Set(days.map((day) => day.dayOfWeek));

  if (uniqueDays.size !== 7) {
    throw new InvalidUserWorkingHoursException(
      'working hours week must include each day from 1 to 7 once',
      { days: days.map((day) => day.dayOfWeek) },
    );
  }

  for (let dayOfWeek = 1; dayOfWeek <= 7; dayOfWeek += 1) {
    if (!uniqueDays.has(dayOfWeek)) {
      throw new InvalidUserWorkingHoursException(
        'working hours week must include each day from 1 to 7 once',
        { missingDayOfWeek: dayOfWeek },
      );
    }
  }
}
