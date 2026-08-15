import { Command } from '@common/application/cqrs';

export type ConfirmEventCommandPayload = {
  userId?: string;
  eventId: string;
  mode: 'MANUAL' | 'AUTO';
};

export class ConfirmEventCommand extends Command<ConfirmEventCommandPayload> {
  constructor(payload: ConfirmEventCommandPayload) {
    super(payload);
  }
}
