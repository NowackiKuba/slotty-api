import { Command } from '@common/application/cqrs';

export type CompleteBroadcastCommandPayload = {
  userId: string;
  broadcastId: string;
};

export class CompleteBroadcastCommand extends Command<CompleteBroadcastCommandPayload> {
  constructor(payload: CompleteBroadcastCommandPayload) {
    super(payload);
  }
}
