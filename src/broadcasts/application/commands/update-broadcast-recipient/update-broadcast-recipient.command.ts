import { Command } from '@common/application/cqrs';
import type { BroadcastRecipientStatusEnum } from '@broadcasts/domain/enums';

export type UpdateBroadcastRecipientCommandPayload = {
  userId: string;
  broadcastId: string;
  customerId: string;
  status: BroadcastRecipientStatusEnum;
  messageId?: string;
  errorMessage?: string;
};

export class UpdateBroadcastRecipientCommand extends Command<UpdateBroadcastRecipientCommandPayload> {
  constructor(payload: UpdateBroadcastRecipientCommandPayload) {
    super(payload);
  }
}
