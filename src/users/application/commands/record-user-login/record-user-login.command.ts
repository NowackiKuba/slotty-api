import { Command } from '@common/application/cqrs';

export type RecordUserLoginCommandPayload = {
  id: string;
  at?: Date;
};

export class RecordUserLoginCommand extends Command<RecordUserLoginCommandPayload> {
  constructor(payload: RecordUserLoginCommandPayload) {
    super(payload);
  }
}
