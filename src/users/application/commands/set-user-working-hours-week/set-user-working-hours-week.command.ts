import { Command } from '@common/application/cqrs';

export type SetUserWorkingHoursWeekDayPayload = {
  dayOfWeek: number;
  startTime?: string;
  endTime?: string;
  isDayOff?: boolean;
};

export type SetUserWorkingHoursWeekCommandPayload = {
  userId: string;
  days: SetUserWorkingHoursWeekDayPayload[];
};

export class SetUserWorkingHoursWeekCommand extends Command<SetUserWorkingHoursWeekCommandPayload> {
  constructor(payload: SetUserWorkingHoursWeekCommandPayload) {
    super(payload);
  }
}
