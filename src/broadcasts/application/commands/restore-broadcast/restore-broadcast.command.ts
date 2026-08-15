import { Command } from '@common/application/cqrs';

export type RestoreBroadcastCommandPayload = {
  userId: string;
  broadcastId: string;
};

export class RestoreBroadcastCommand extends Command<RestoreBroadcastCommandPayload> {
  constructor(payload: RestoreBroadcastCommandPayload) {
    super(payload);
  }
}
