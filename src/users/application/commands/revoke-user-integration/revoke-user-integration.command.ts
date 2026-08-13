import { Command } from '@common/application/cqrs';

export type RevokeUserIntegrationCommandPayload = {
  userId: string;
  provider: string;
};

export class RevokeUserIntegrationCommand extends Command<RevokeUserIntegrationCommandPayload> {
  constructor(payload: RevokeUserIntegrationCommandPayload) {
    super(payload);
  }
}
