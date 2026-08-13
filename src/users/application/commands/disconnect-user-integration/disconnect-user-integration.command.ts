import { Command } from '@common/application/cqrs';

export type DisconnectUserIntegrationCommandPayload = {
  userId: string;
  provider: string;
};

export class DisconnectUserIntegrationCommand extends Command<DisconnectUserIntegrationCommandPayload> {
  constructor(payload: DisconnectUserIntegrationCommandPayload) {
    super(payload);
  }
}
