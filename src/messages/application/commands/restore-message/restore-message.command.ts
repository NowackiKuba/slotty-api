import { Command } from '@common/application/cqrs';

export type RestoreMessageCommandPayload = {
  userId: string;
  messageId: string;
};

export class RestoreMessageCommand extends Command<RestoreMessageCommandPayload> {
  constructor(payload: RestoreMessageCommandPayload) {
    super(payload);
  }
}
