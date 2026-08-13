import { Command } from '@common/application/cqrs';

export type MarkUserIntegrationErrorCommandPayload = {
  userId: string;
  provider: string;
  message: string;
};

export class MarkUserIntegrationErrorCommand extends Command<MarkUserIntegrationErrorCommandPayload> {
  constructor(payload: MarkUserIntegrationErrorCommandPayload) {
    super(payload);
  }
}
