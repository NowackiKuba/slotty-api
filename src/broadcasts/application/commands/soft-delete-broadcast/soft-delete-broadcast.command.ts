import { Command } from '@common/application/cqrs';

export type SoftDeleteBroadcastCommandPayload = {
  userId: string;
  broadcastId: string;
};

export class SoftDeleteBroadcastCommand extends Command<SoftDeleteBroadcastCommandPayload> {
  constructor(payload: SoftDeleteBroadcastCommandPayload) {
    super(payload);
  }
}
