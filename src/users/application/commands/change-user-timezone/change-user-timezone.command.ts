import { Command } from '@common/application/cqrs';

export type ChangeUserTimezoneCommandPayload = {
  id: string;
  timezone: string;
};

export class ChangeUserTimezoneCommand extends Command<ChangeUserTimezoneCommandPayload> {
  constructor(payload: ChangeUserTimezoneCommandPayload) {
    super(payload);
  }
}
