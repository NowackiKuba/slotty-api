import { Command } from '@common/application/cqrs';
import type { MessageChannel } from '@messages/domain/enums';

export type UpdateBroadcastCommandPayload = {
  userId: string;
  broadcastId: string;
  messageText?: string;
  targetChannel?: MessageChannel;
  scheduledAt?: Date;
  customerIds?: string[];
};

export class UpdateBroadcastCommand extends Command<UpdateBroadcastCommandPayload> {
  constructor(payload: UpdateBroadcastCommandPayload) {
    super(payload);
  }
}
