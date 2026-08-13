import type { UserReadModel } from '@users/application/read-models';

export type AuthTokensReadModel = {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
};

export type AuthSessionReadModel = {
  isNewUser: boolean;
  tokens: AuthTokensReadModel;
  user: UserReadModel;
};
