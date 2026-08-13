import { InvalidAuthProviderException } from '@auth/domain/exceptions';

export const AuthProviders = {
  GOOGLE: 'google',
  APPLE: 'apple',
} as const;

export type AuthProviderValue =
  (typeof AuthProviders)[keyof typeof AuthProviders];

const AUTH_PROVIDER_VALUES = new Set<string>(Object.values(AuthProviders));

export class AuthProvider {
  private constructor(private readonly _value: AuthProviderValue) {}

  static create(value: string): AuthProvider {
    if (!AUTH_PROVIDER_VALUES.has(value)) {
      throw new InvalidAuthProviderException(value);
    }

    return new AuthProvider(value as AuthProviderValue);
  }

  static google(): AuthProvider {
    return new AuthProvider(AuthProviders.GOOGLE);
  }

  static apple(): AuthProvider {
    return new AuthProvider(AuthProviders.APPLE);
  }

  get value(): AuthProviderValue {
    return this._value;
  }

  equals(other: AuthProvider): boolean {
    return this._value === other._value;
  }
}
