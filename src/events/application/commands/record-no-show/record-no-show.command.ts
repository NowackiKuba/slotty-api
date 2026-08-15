import { Command } from '@common/application/cqrs';

export type RecordNoShowCommandPayload = {
  eventId: string;
  userId: string;
};

export class RecordNoShowCommand extends Command<RecordNoShowCommandPayload> {
  constructor(payload: RecordNoShowCommandPayload) {
    super(payload);
  }
}
