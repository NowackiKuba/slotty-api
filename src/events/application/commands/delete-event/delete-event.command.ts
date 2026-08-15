import { Command } from '@common/application/cqrs';

export type DeleteEventCommandPayload = {
  userId: string;
  eventId: string;
};

export class DeleteEventCommand extends Command<DeleteEventCommandPayload> {
  constructor(payload: DeleteEventCommandPayload) {
    super(payload);
  }
}
