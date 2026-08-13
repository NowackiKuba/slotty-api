export type VerifiedSocialIdentity = {
  provider: 'google' | 'apple';
  providerUserId: string;
  email: string | null;
  emailVerified: boolean;
  firstName: string | null;
  lastName: string | null;
  displayName: string | null;
  avatarUrl: string | null;
};

export interface SocialTokenVerifier {
  verify(idToken: string): Promise<VerifiedSocialIdentity>;
}
