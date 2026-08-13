import { Command } from '@common/application/cqrs';

export type MarkUserIntegrationExpiredCommandPayload = {
  userId: string;
  provider: string;
};

export class MarkUserIntegrationExpiredCommand extends Command<MarkUserIntegrationExpiredCommandPayload> {
  constructor(payload: MarkUserIntegrationExpiredCommandPayload) {
    super(payload);
  }
}
