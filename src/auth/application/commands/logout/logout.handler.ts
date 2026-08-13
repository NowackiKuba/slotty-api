import {
  CommandHandler,
  type ICommandHandler,
} from '@common/application/cqrs';
import { TokenService } from '@auth/infrastructure/tokens/token.service';
import { LogoutCommand } from './logout.command';

@CommandHandler(LogoutCommand)
export class LogoutHandler implements ICommandHandler<LogoutCommand, void> {
  constructor(private readonly tokens: TokenService) {}

  async execute(command: LogoutCommand): Promise<void> {
    const { refreshToken } = command.payload;
    await this.tokens.revokeRefreshToken(refreshToken);
  }
}
