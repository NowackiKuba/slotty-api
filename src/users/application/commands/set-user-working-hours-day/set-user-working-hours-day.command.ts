import { Command } from '@common/application/cqrs';

export type SetUserWorkingHoursDayCommandPayload = {
  userId: string;
  dayOfWeek: number;
  startTime?: string;
  endTime?: string;
  isDayOff?: boolean;
};

export class SetUserWorkingHoursDayCommand extends Command<SetUserWorkingHoursDayCommandPayload> {
  constructor(payload: SetUserWorkingHoursDayCommandPayload) {
    super(payload);
  }
}
