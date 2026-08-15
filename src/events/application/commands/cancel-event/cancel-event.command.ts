import { Command } from '@common/application/cqrs';

export type CancelEventCommandPayload = {
  eventId: string;
  userId: string;
  byWho: 'TRAINER' | 'CUSTOMER';
};

export class CancelEventCommand extends Command<CancelEventCommandPayload> {
  constructor(payload: CancelEventCommandPayload) {
    super(payload);
  }
}
