import { Command } from '@common/application/cqrs';

export type FailBroadcastCommandPayload = {
  userId: string;
  broadcastId: string;
};

export class FailBroadcastCommand extends Command<FailBroadcastCommandPayload> {
  constructor(payload: FailBroadcastCommandPayload) {
    super(payload);
  }
}
