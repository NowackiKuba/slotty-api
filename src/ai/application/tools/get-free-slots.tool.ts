import { Injectable } from '@nestjs/common';
import { QueryBus } from '@common/application/cqrs';
import { addLocalDays } from '@common/application/utils/local-date.util';
import { ListEventsInRangeQuery } from '@events/application/queries/list-events-in-range/list-events-in-range.query';
import type { EventReadModel } from '@events/application/read-models';
import { EventStatusEnum } from '@events/domain/value-objects';
import { GetUserByIdQuery } from '@users/application/queries/get-user-by-id/get-user-by-id.query';
import { GetUserProfileByUserIdQuery } from '@users/application/queries/get-user-profile-by-user-id/get-user-profile-by-user-id.query';
import { ListUserWorkingHoursQuery } from '@users/application/queries/list-user-working-hours/list-user-working-hours.query';
import type {
  UserProfileReadModel,
  UserReadModel,
  UserWorkingHoursReadModel,
} from '@users/application/read-models';
import { BaseTool, type ToolExecutionContext } from './base.tool';
import {
  assertDateKey,
  eachDateKey,
  formatDateKeyInTimeZone,
  weekdayOfDateKey,
  zonedLocalToUtc,
} from '../utils/zoned-datetime.util';

const MIN_DURATION_MINUTES = 15;
const MAX_DURATION_MINUTES = 240;
const MAX_RANGE_DAYS = 14;
const MAX_SLOTS = 40;
const DEFAULT_RANGE_DAYS = 7;
const OPEN_EVENT_STATUSES = new Set<string>([
  EventStatusEnum.SCHEDULED,
  EventStatusEnum.CONFIRMED,
]);

@Injectable()
export class GetFreeSlotsTool extends BaseTool {
  readonly name = 'get_free_slots';
  readonly description =
    'List available booking slots on the trainer calendar within a date range. Dates are interpreted in the trainer timezone.';
  readonly parameters = {
    type: 'object',
    additionalProperties: false,
    properties: {
      from: {
        type: 'string',
        description: 'Range start as YYYY-MM-DD. Defaults to today.',
      },
      to: {
        type: 'string',
        description:
          'Range end as YYYY-MM-DD (inclusive). Defaults to 7 days after from.',
      },
      durationMinutes: {
        type: 'integer',
        description:
          'Slot length in minutes. Defaults to the trainer session length.',
      },
    },
  };

  constructor(private readonly queryBus: QueryBus) {
    super();
  }

  async execute(
    args: Record<string, unknown>,
    context: ToolExecutionContext,
  ): Promise<unknown> {
    const [profile, user, workingHours] = await Promise.all([
      this.queryBus.execute<GetUserProfileByUserIdQuery, UserProfileReadModel>(
        new GetUserProfileByUserIdQuery({ userId: context.trainerId }),
      ),
      this.queryBus.execute<GetUserByIdQuery, UserReadModel>(
        new GetUserByIdQuery({ id: context.trainerId }),
      ),
      this.queryBus.execute<
        ListUserWorkingHoursQuery,
        UserWorkingHoursReadModel[]
      >(new ListUserWorkingHoursQuery({ userId: context.trainerId })),
    ]);

    const durationMinutes = resolveDurationMinutes(
      args.durationMinutes,
      profile.sessionDurationMinutes,
    );
    const todayKey = formatDateKeyInTimeZone(new Date(), user.timezone);
    const fromKey = optionalDateKey(args.from, 'from') ?? todayKey;
    const toKey =
      optionalDateKey(args.to, 'to') ??
      addLocalDays(fromKey, DEFAULT_RANGE_DAYS - 1);

    if (toKey < fromKey) {
      throw new Error('to must be on or after from');
    }

    const days = eachDateKey(fromKey, toKey);

    if (days.length > MAX_RANGE_DAYS) {
      throw new Error(`Date range cannot exceed ${MAX_RANGE_DAYS} days`);
    }

    const rangeStart = zonedLocalToUtc(fromKey, '00:00', user.timezone);
    const rangeEnd = zonedLocalToUtc(
      addLocalDays(toKey, 1),
      '00:00',
      user.timezone,
    );
    const events = await this.queryBus.execute<
      ListEventsInRangeQuery,
      EventReadModel[]
    >(
      new ListEventsInRangeQuery({
        userId: context.trainerId,
        from: rangeStart,
        to: rangeEnd,
      }),
    );
    const busy = events.filter((event) =>
      OPEN_EVENT_STATUSES.has(event.status),
    );
    const hoursByDay = new Map(workingHours.map((row) => [row.dayOfWeek, row]));
    const now = Date.now();
    const slots: Array<{ start: string; end: string }> = [];
    const durationMs = durationMinutes * 60 * 1000;

    for (const dateKey of days) {
      const hours = hoursByDay.get(weekdayOfDateKey(dateKey));

      if (!hours || hours.isDayOff) {
        continue;
      }

      const windowStart = zonedLocalToUtc(
        dateKey,
        hours.startTime,
        user.timezone,
      );
      const windowEnd = zonedLocalToUtc(dateKey, hours.endTime, user.timezone);

      for (
        let startMs = windowStart.getTime();
        startMs + durationMs <= windowEnd.getTime();
        startMs += durationMs
      ) {
        if (startMs < now) {
          continue;
        }

        const start = new Date(startMs);
        const end = new Date(startMs + durationMs);

        if (overlapsBusy(start, end, busy)) {
          continue;
        }

        slots.push({
          start: start.toISOString(),
          end: end.toISOString(),
        });

        if (slots.length >= MAX_SLOTS) {
          return {
            timezone: user.timezone,
            durationMinutes,
            truncated: true,
            slots,
          };
        }
      }
    }

    return {
      timezone: user.timezone,
      durationMinutes,
      truncated: false,
      slots,
    };
  }
}

function optionalDateKey(value: unknown, field: string): string | undefined {
  if (value === undefined || value === null || value === '') {
    return undefined;
  }

  if (typeof value !== 'string') {
    throw new Error(`${field} must be a YYYY-MM-DD date`);
  }

  return assertDateKey(value.trim(), field);
}

function resolveDurationMinutes(value: unknown, fallback: number): number {
  if (value === undefined || value === null || value === '') {
    return fallback;
  }

  const parsed = Number(value);

  if (!Number.isInteger(parsed)) {
    throw new Error('durationMinutes must be an integer');
  }

  if (parsed < MIN_DURATION_MINUTES || parsed > MAX_DURATION_MINUTES) {
    throw new Error(
      `durationMinutes must be between ${MIN_DURATION_MINUTES} and ${MAX_DURATION_MINUTES}`,
    );
  }

  return parsed;
}

function overlapsBusy(start: Date, end: Date, busy: EventReadModel[]): boolean {
  return busy.some((event) => start < event.endDate && end > event.startDate);
}
