import { Command } from '@common/application/cqrs';

export type SoftDeleteMessageCommandPayload = {
  userId: string;
  messageId: string;
};

export class SoftDeleteMessageCommand extends Command<SoftDeleteMessageCommandPayload> {
  constructor(payload: SoftDeleteMessageCommandPayload) {
    super(payload);
  }
}
