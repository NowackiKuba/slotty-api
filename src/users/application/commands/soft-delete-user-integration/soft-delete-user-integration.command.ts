import { Command } from '@common/application/cqrs';

export type SoftDeleteUserIntegrationCommandPayload = {
  userId: string;
  provider: string;
};

export class SoftDeleteUserIntegrationCommand extends Command<SoftDeleteUserIntegrationCommandPayload> {
  constructor(payload: SoftDeleteUserIntegrationCommandPayload) {
    super(payload);
  }
}
