import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createRemoteJWKSet, jwtVerify } from 'jose';
import { InvalidSocialTokenException } from '@auth/domain/exceptions';
import type {
  SocialTokenVerifier,
  VerifiedSocialIdentity,
} from './social-token-verifier';

const APPLE_ISSUER = 'https://appleid.apple.com';
const APPLE_JWKS = createRemoteJWKSet(
  new URL('https://appleid.apple.com/auth/keys'),
);

@Injectable()
export class AppleTokenVerifier implements SocialTokenVerifier {
  private readonly audiences: string[];

  constructor(private readonly config: ConfigService) {
    this.audiences = (config.get<string>('APPLE_CLIENT_IDS') ?? '')
      .split(',')
      .map((value) => value.trim())
      .filter(Boolean);
  }

  async verify(idToken: string): Promise<VerifiedSocialIdentity> {
    if (this.audiences.length === 0) {
      throw new InvalidSocialTokenException(
        'apple',
        'APPLE_CLIENT_IDS is not configured',
      );
    }

    try {
      const { payload } = await jwtVerify(idToken, APPLE_JWKS, {
        issuer: APPLE_ISSUER,
        audience: this.audiences,
      });

      if (!payload.sub || typeof payload.sub !== 'string') {
        throw new InvalidSocialTokenException('apple', 'Missing subject');
      }

      const email =
        typeof payload.email === 'string' ? payload.email : null;
      const emailVerified =
        payload.email_verified === true ||
        payload.email_verified === 'true';

      return {
        provider: 'apple',
        providerUserId: payload.sub,
        email,
        emailVerified,
        firstName: null,
        lastName: null,
        displayName: email?.split('@')[0] ?? null,
        avatarUrl: null,
      };
    } catch (error) {
      if (error instanceof InvalidSocialTokenException) {
        throw error;
      }

      throw new InvalidSocialTokenException(
        'apple',
        error instanceof Error ? error.message : 'Verification failed',
      );
    }
  }
}
