import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { OAuth2Client } from 'google-auth-library';
import { InvalidSocialTokenException } from '@auth/domain/exceptions';
import type {
  SocialTokenVerifier,
  VerifiedSocialIdentity,
} from './social-token-verifier';

@Injectable()
export class GoogleTokenVerifier implements SocialTokenVerifier {
  private readonly client: OAuth2Client;
  private readonly audiences: string[];

  constructor(private readonly config: ConfigService) {
    this.client = new OAuth2Client();
    this.audiences = (config.get<string>('GOOGLE_CLIENT_IDS') ?? '')
      .split(',')
      .map((value) => value.trim())
      .filter(Boolean);
  }

  async verify(idToken: string): Promise<VerifiedSocialIdentity> {
    if (this.audiences.length === 0) {
      throw new InvalidSocialTokenException(
        'google',
        'GOOGLE_CLIENT_IDS is not configured',
      );
    }

    try {
      const ticket = await this.client.verifyIdToken({
        idToken,
        audience: this.audiences,
      });
      const payload = ticket.getPayload();

      if (!payload?.sub) {
        throw new InvalidSocialTokenException('google', 'Missing subject');
      }

      const fullName = payload.name?.trim() ?? '';
      const [firstNameFromName, ...rest] = fullName.split(/\s+/).filter(Boolean);

      return {
        provider: 'google',
        providerUserId: payload.sub,
        email: payload.email ?? null,
        emailVerified: payload.email_verified === true,
        firstName: payload.given_name ?? firstNameFromName ?? null,
        lastName: payload.family_name ?? (rest.length ? rest.join(' ') : null),
        displayName: payload.name ?? payload.email?.split('@')[0] ?? null,
        avatarUrl: payload.picture ?? null,
      };
    } catch (error) {
      if (error instanceof InvalidSocialTokenException) {
        throw error;
      }

      throw new InvalidSocialTokenException(
        'google',
        error instanceof Error ? error.message : 'Verification failed',
      );
    }
  }
}
