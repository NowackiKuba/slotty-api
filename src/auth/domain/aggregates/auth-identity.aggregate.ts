import { AggregateRoot } from '@common/domain';
import type {
  AuthIdentityProps,
  AuthIdentitySnapshot,
  CreateAuthIdentityProps,
} from '@auth/domain/types';
import { AuthIdentityId, AuthProvider } from '@auth/domain/value-objects';
import type { UserId } from '@users/domain/value-objects';

export class AuthIdentity extends AggregateRoot<AuthIdentityId> {
  private _userId: UserId;
  private _provider: AuthProvider;
  private _providerUserId: string;
  private _email: string | null;

  private constructor(props: AuthIdentityProps) {
    super(props);
    this._userId = props.userId;
    this._provider = props.provider;
    this._providerUserId = props.providerUserId;
    this._email = props.email;
  }

  static create(props: CreateAuthIdentityProps): AuthIdentity {
    return new AuthIdentity({
      id: AuthIdentityId.create(),
      userId: props.userId,
      provider: props.provider,
      providerUserId: props.providerUserId,
      email: props.email ?? null,
    });
  }

  static reconstitute(props: AuthIdentityProps): AuthIdentity {
    return new AuthIdentity(props);
  }

  get userId(): UserId {
    return this._userId;
  }

  get provider(): AuthProvider {
    return this._provider;
  }

  get providerUserId(): string {
    return this._providerUserId;
  }

  get email(): string | null {
    return this._email;
  }

  updateEmail(email: string | null): void {
    if (this._email === email) {
      return;
    }

    this._email = email;
    this.touch();
  }

  toSnapshot(): AuthIdentitySnapshot {
    return {
      id: this.id,
      userId: this._userId,
      provider: this._provider,
      providerUserId: this._providerUserId,
      email: this._email,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
      deletedAt: this.deletedAt,
    };
  }
}
