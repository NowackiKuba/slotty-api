import { Command } from '@common/application/cqrs';

export type UpdateUserIntegrationSettingsCommandPayload = {
  userId: string;
  provider: string;
  settings: unknown;
};

export class UpdateUserIntegrationSettingsCommand extends Command<UpdateUserIntegrationSettingsCommandPayload> {
  constructor(payload: UpdateUserIntegrationSettingsCommandPayload) {
    super(payload);
  }
}
