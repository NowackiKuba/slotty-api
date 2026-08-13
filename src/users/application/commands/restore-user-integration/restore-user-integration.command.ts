import { Command } from '@common/application/cqrs';

export type RestoreUserIntegrationCommandPayload = {
  userId: string;
  provider: string;
};

export class RestoreUserIntegrationCommand extends Command<RestoreUserIntegrationCommandPayload> {
  constructor(payload: RestoreUserIntegrationCommandPayload) {
    super(payload);
  }
}
