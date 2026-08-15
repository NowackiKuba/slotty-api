import { Command } from '@common/application/cqrs';

export type CompleteEventCommandPayload = {
  userId: string;
  eventId: string;
};

export class CompleteEventCommand extends Command<CompleteEventCommandPayload> {
  constructor(payload: CompleteEventCommandPayload) {
    super(payload);
  }
}
