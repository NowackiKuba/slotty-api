import { Command } from '@common/application/cqrs';

export type StartIntegrationOAuthCommandPayload = {
  userId: string;
  provider: string;
};

export class StartIntegrationOAuthCommand extends Command<StartIntegrationOAuthCommandPayload> {
  constructor(payload: StartIntegrationOAuthCommandPayload) {
    super(payload);
  }
}
