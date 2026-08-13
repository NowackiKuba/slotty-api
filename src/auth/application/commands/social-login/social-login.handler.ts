import { randomBytes } from 'node:crypto';
import { Inject } from '@nestjs/common';
import { CommandHandler, type ICommandHandler } from '@common/application/cqrs';
import { AuthSessionReadModelMapper } from '@auth/application/mappers';
import type { AuthSessionReadModel } from '@auth/application/read-models';
import { AuthIdentity } from '@auth/domain/aggregates';
import {
  SocialEmailRequiredException,
  UserNotActiveException,
} from '@auth/domain/exceptions';
import type { IAuthIdentityRepository } from '@auth/domain/repositories';
import { AUTH_IDENTITY_REPOSITORY } from '@auth/domain/tokens';
import { AuthProvider } from '@auth/domain/value-objects';
import { AppleTokenVerifier } from '@auth/infrastructure/providers/apple-token.verifier';
import { GoogleTokenVerifier } from '@auth/infrastructure/providers/google-token.verifier';
import type { VerifiedSocialIdentity } from '@auth/infrastructure/providers/social-token-verifier';
import { TokenService } from '@auth/infrastructure/tokens/token.service';
import { User } from '@users/domain/aggregates';
import { UserNotFoundException } from '@users/domain/exceptions/user';
import type { IUserRepository } from '@users/domain/repositories';
import { USER_REPOSITORY } from '@users/domain/tokens';
import { SocialLoginCommand } from './social-login.command';

@CommandHandler(SocialLoginCommand)
export class SocialLoginHandler implements ICommandHandler<
  SocialLoginCommand,
  AuthSessionReadModel
> {
  constructor(
    private readonly mapper: AuthSessionReadModelMapper,
    private readonly tokens: TokenService,
    private readonly googleVerifier: GoogleTokenVerifier,
    private readonly appleVerifier: AppleTokenVerifier,
    @Inject(USER_REPOSITORY)
    private readonly userRepository: IUserRepository,
    @Inject(AUTH_IDENTITY_REPOSITORY)
    private readonly identityRepository: IAuthIdentityRepository,
  ) {}

  async execute(command: SocialLoginCommand): Promise<AuthSessionReadModel> {
    const { provider, idToken, firstName, lastName, displayName } =
      command.payload;

    const identity = await this.verifyToken(provider, idToken);
    const authProvider = AuthProvider.create(identity.provider);
    const existingIdentity = await this.identityRepository.findByProvider(
      authProvider,
      identity.providerUserId,
    );

    if (existingIdentity) {
      const user = await this.userRepository.findById(existingIdentity.userId);

      if (!user) {
        throw new UserNotFoundException(existingIdentity.userId.value);
      }

      this.assertActive(user);
      await this.syncExistingIdentity(existingIdentity, identity);
      this.applyProfileUpdates(user, identity);
      user.recordLogin();
      await this.userRepository.save(user);

      return this.mapper.toReadModel(
        user,
        await this.tokens.issueForUser(user),
        false,
      );
    }

    if (!identity.email) {
      throw new SocialEmailRequiredException(identity.provider);
    }

    let user = await this.userRepository.findByEmail(identity.email);
    let isNewUser = false;

    if (user) {
      this.assertActive(user);
      this.applyProfileUpdates(user, identity);
    } else {
      isNewUser = true;
      user = User.create({
        firstName: firstName ?? identity.firstName ?? 'User',
        lastName: lastName ?? identity.lastName ?? '',
        displayName: await this.resolveDisplayName(
          displayName ??
            identity.displayName ??
            identity.email.split('@')[0] ??
            'user',
        ),
        email: identity.email,
        avatarUrl: identity.avatarUrl ?? undefined,
      });

      if (identity.emailVerified) {
        user.verifyEmail();
      }
    }

    user.recordLogin();
    await this.userRepository.save(user);

    await this.identityRepository.save(
      AuthIdentity.create({
        userId: user.id,
        provider: authProvider,
        providerUserId: identity.providerUserId,
        email: identity.email,
      }),
    );

    return this.mapper.toReadModel(
      user,
      await this.tokens.issueForUser(user),
      isNewUser,
    );
  }

  private async verifyToken(
    provider: 'google' | 'apple',
    idToken: string,
  ): Promise<VerifiedSocialIdentity> {
    if (provider === 'google') {
      return this.googleVerifier.verify(idToken);
    }

    return this.appleVerifier.verify(idToken);
  }

  private async syncExistingIdentity(
    existingIdentity: AuthIdentity,
    identity: VerifiedSocialIdentity,
  ): Promise<void> {
    if (identity.email && existingIdentity.email !== identity.email) {
      existingIdentity.updateEmail(identity.email);
      await this.identityRepository.save(existingIdentity);
    }
  }

  private applyProfileUpdates(
    user: User,
    identity: VerifiedSocialIdentity,
  ): void {
    if (identity.emailVerified) {
      user.verifyEmail();
    }

    if (identity.avatarUrl) {
      user.changeAvatarUrl(identity.avatarUrl);
    }
  }

  private assertActive(user: User): void {
    if (!user.status.isActive) {
      throw new UserNotActiveException(user.id.value, user.status.value);
    }
  }

  private async resolveDisplayName(base: string): Promise<string> {
    const normalized = base.trim().slice(0, 40) || 'user';
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
