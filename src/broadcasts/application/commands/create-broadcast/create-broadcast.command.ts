import { Command } from '@common/application/cqrs';
import type { MessageChannel } from '@messages/domain/enums';

export type CreateBroadcastCommandPayload = {
  userId: string;
  messageText: string;
  targetChannel: MessageChannel;
  scheduledAt?: Date;
  customerIds: string[];
};

export class CreateBroadcastCommand extends Command<CreateBroadcastCommandPayload> {
  constructor(payload: CreateBroadcastCommandPayload) {
    super(payload);
  }
}
