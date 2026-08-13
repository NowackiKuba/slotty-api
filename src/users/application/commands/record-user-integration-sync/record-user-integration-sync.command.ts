import { Command } from '@common/application/cqrs';

export type RecordUserIntegrationSyncCommandPayload = {
  userId: string;
  provider: string;
  syncedAt?: Date;
};

export class RecordUserIntegrationSyncCommand extends Command<RecordUserIntegrationSyncCommandPayload> {
  constructor(payload: RecordUserIntegrationSyncCommandPayload) {
    super(payload);
  }
}
