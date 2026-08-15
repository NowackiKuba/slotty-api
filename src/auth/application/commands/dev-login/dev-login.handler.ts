import { randomBytes } from 'node:crypto';
import { Inject } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { CommandHandler, type ICommandHandler } from '@common/application/cqrs';
import { AuthSessionReadModelMapper } from '@auth/application/mappers';
import type { AuthSessionReadModel } from '@auth/application/read-models';
import {
  DevLoginDisabledException,
  UserNotActiveException,
} from '@auth/domain/exceptions';
import { TokenService } from '@auth/infrastructure/tokens/token.service';
import { User } from '@users/domain/aggregates';
import type { IUserRepository } from '@users/domain/repositories';
import { USER_REPOSITORY } from '@users/domain/tokens';
import { DevLoginCommand } from './dev-login.command';

@CommandHandler(DevLoginCommand)
export class DevLoginHandler implements ICommandHandler<
  DevLoginCommand,
  AuthSessionReadModel
> {
  constructor(
    private readonly mapper: AuthSessionReadModelMapper,
    private readonly tokens: TokenService,
    private readonly config: ConfigService,
    @Inject(USER_REPOSITORY)
    private readonly userRepository: IUserRepository,
  ) {}

  async execute(command: DevLoginCommand): Promise<AuthSessionReadModel> {
    if (this.config.get<string>('NODE_ENV') === 'production') {
      throw new DevLoginDisabledException();
    }

    const { email, firstName, lastName, displayName } = command.payload;
    const existing = await this.userRepository.findByEmail(email);

    if (existing) {
      if (!existing.status.isActive) {
        throw new UserNotActiveException(
          existing.id.value,
          existing.status.value,
        );
      }

      existing.recordLogin();
      await this.userRepository.save(existing);

      return this.mapper.toReadModel(
        existing,
        await this.tokens.issueForUser(existing),
        false,
      );
    }

    const user = User.create({
      firstName: firstName ?? 'Dev',
      lastName: lastName ?? 'User',
      displayName: await this.resolveDisplayName(
        displayName ?? email.split('@')[0] ?? 'dev',
      ),
      email,
    });
    user.verifyEmail();
    user.recordLogin();
    await this.userRepository.save(user);

    return this.mapper.toReadModel(
      user,
      await this.tokens.issueForUser(user),
      true,
    );
  }

  private async resolveDisplayName(base: string): Promise<string> {
    const normalized = base.trim().slice(0, 40) || 'dev';
    const existing = await this.userRepository.findByDisplayName(normalized);

    if (!existing) {
      return normalized;
    }

    for (let attempt = 0; attempt < 8; attempt += 1) {
      const candidate = `${normalized}_${randomBytes(2).toString('hex')}`;
      const taken = await this.userRepository.findByDisplayName(candidate);

      if (!taken) {
        return candidate;
      }
    }

    return `${normalized}_${Date.now()}`;
  }
}
