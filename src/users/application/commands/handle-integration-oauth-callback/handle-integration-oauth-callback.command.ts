import { Command } from '@common/application/cqrs';

export type HandleIntegrationOAuthCallbackCommandPayload = {
  provider: string;
  code?: string;
  state?: string;
  error?: string;
  errorDescription?: string;
};

export class HandleIntegrationOAuthCallbackCommand extends Command<HandleIntegrationOAuthCallbackCommandPayload> {
  constructor(payload: HandleIntegrationOAuthCallbackCommandPayload) {
    super(payload);
  }
}
