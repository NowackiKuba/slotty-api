import { Command } from '@common/application/cqrs';

export type UpdateUserIntegrationTokensCommandPayload = {
  userId: string;
  provider: string;
  accessToken: string;
  refreshToken?: string | null;
  expiresAt?: Date | null;
};

export class UpdateUserIntegrationTokensCommand extends Command<UpdateUserIntegrationTokensCommandPayload> {
  constructor(payload: UpdateUserIntegrationTokensCommandPayload) {
    super(payload);
  }
}
