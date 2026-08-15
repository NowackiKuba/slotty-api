import { Command } from '@common/application/cqrs';

export type StartBroadcastCommandPayload = {
  userId: string;
  broadcastId: string;
};

export class StartBroadcastCommand extends Command<StartBroadcastCommandPayload> {
  constructor(payload: StartBroadcastCommandPayload) {
    super(payload);
  }
}
