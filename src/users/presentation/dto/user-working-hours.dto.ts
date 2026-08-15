import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

const TIME_REGEX = /^([01]\d|2[0-3]):[0-5]\d$/;

const workingHoursDaySchema = z.object({
  dayOfWeek: z.number().int().min(1).max(7),
  startTime: z.string().regex(TIME_REGEX).optional(),
  endTime: z.string().regex(TIME_REGEX).optional(),
  isDayOff: z.boolean().optional(),
});

export const setUserWorkingHoursDaySchema = z.object({
  startTime: z.string().regex(TIME_REGEX).optional(),
  endTime: z.string().regex(TIME_REGEX).optional(),
  isDayOff: z.boolean().optional(),
});

export class SetUserWorkingHoursDayDto extends createZodDto(
  setUserWorkingHoursDaySchema,
) {}

export const setUserWorkingHoursWeekSchema = z
  .object({
    days: z.array(workingHoursDaySchema).length(7),
  })
  .refine(
    (value) => new Set(value.days.map((day) => day.dayOfWeek)).size === 7,
    {
      message: 'working hours week must include each day from 1 to 7 once',
      path: ['days'],
    },
  );

export class SetUserWorkingHoursWeekDto extends createZodDto(
  setUserWorkingHoursWeekSchema,
) {}
