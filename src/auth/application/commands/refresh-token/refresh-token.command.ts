import { Command } from '@common/application/cqrs';

export type RefreshTokenCommandPayload = {
  refreshToken: string;
};

export class RefreshTokenCommand extends Command<RefreshTokenCommandPayload> {
  constructor(payload: RefreshTokenCommandPayload) {
    super(payload);
  }
}
