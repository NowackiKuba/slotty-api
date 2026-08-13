import { Command } from '@common/application/cqrs';

export type LogoutCommandPayload = {
  refreshToken: string;
};

export class LogoutCommand extends Command<LogoutCommandPayload> {
  constructor(payload: LogoutCommandPayload) {
    super(payload);
  }
}
