import { AggregateRoot } from '@common/domain';
import {
  IntegrationProviderEnum,
  isIntegrationProvider,
} from '@users/domain/enums';
import { InvalidIntegrationProviderException } from '@users/domain/exceptions/integration';
import type {
  CreateUserIntegrationProps,
  IntegrationSettings,
  UserIntegrationProps,
  UserIntegrationSnapshot,
} from '@users/domain/types';
import {
  IntegrationStatus,
  UserId,
  UserIntegrationId,
} from '@users/domain/value-objects';

const TOKEN_EXPIRY_BUFFER_MS = 5 * 60 * 1000;

export class UserIntegration extends AggregateRoot<UserIntegrationId> {
  private _userId: UserId;
  private _provider: IntegrationProviderEnum;
  private _status: IntegrationStatus;
  private _externalAccountId: string | null;
  private _accessToken: string | null;
  private _refreshToken: string | null;
  private _expiresAt: Date | null;
  private _scopes: string[];
  private _settings: IntegrationSettings;
  private _lastSyncedAt: Date | null;
  private _errorMessage: string | null;

  private constructor(props: UserIntegrationProps) {
    super(props);
    this._userId = props.userId;
    this._provider = props.provider;
    this._status = props.status;
    this._externalAccountId = props.externalAccountId;
    this._accessToken = props.accessToken;
    this._refreshToken = props.refreshToken;
    this._expiresAt = props.expiresAt;
    this._scopes = props.scopes;
    this._settings = props.settings;
    this._lastSyncedAt = props.lastSyncedAt;
    this._errorMessage = props.errorMessage;
  }

  static create(props: CreateUserIntegrationProps): UserIntegration {
    return new UserIntegration({
      id: UserIntegrationId.create(props.id),
      userId: UserId.create(props.userId),
      provider: parseProvider(props.provider),
      status: IntegrationStatus.connected(),
      externalAccountId: props.externalAccountId?.trim() ?? null,
      accessToken: props.accessToken ?? null,
      refreshToken: props.refreshToken ?? null,
      expiresAt: props.expiresAt ?? null,
      scopes: props.scopes ?? [],
      settings: props.settings ?? {},
      lastSyncedAt: null,
      errorMessage: null,
    });
  }

  static reconstitute(props: UserIntegrationProps): UserIntegration {
    return new UserIntegration(props);
  }

  get userId(): UserId {
    return this._userId;
  }

  get provider(): IntegrationProviderEnum {
    return this._provider;
  }

  get status(): IntegrationStatus {
    return this._status;
  }

  get externalAccountId(): string | null {
    return this._externalAccountId;
  }

  get accessToken(): string | null {
    return this._accessToken;
  }

  get refreshToken(): string | null {
    return this._refreshToken;
  }

  get expiresAt(): Date | null {
    return this._expiresAt;
  }

  get scopes(): string[] {
    return [...this._scopes];
  }

  get settings(): IntegrationSettings {
    return this._settings;
  }

  get lastSyncedAt(): Date | null {
    return this._lastSyncedAt;
  }

  get errorMessage(): string | null {
    return this._errorMessage;
  }

  isTokenExpired(): boolean {
    if (!this._expiresAt) {
      return false;
    }

    return this._expiresAt.getTime() - TOKEN_EXPIRY_BUFFER_MS <= Date.now();
  }

  markAsExpired(): void {
    this._status = IntegrationStatus.expired();
    this._errorMessage = null;
    this.touch();
  }

  markAsError(message: string): void {
    this._status = IntegrationStatus.error();
    this._errorMessage = message.trim();
    this.touch();
  }

  updateTokens(
    accessToken: string,
    refreshToken?: string,
    expiresAt?: Date,
  ): void {
    this._accessToken = accessToken;

    if (refreshToken !== undefined) {
      this._refreshToken = refreshToken;
    }

    if (expiresAt !== undefined) {
      this._expiresAt = expiresAt;
    }

    this._status = IntegrationStatus.connected();
    this._errorMessage = null;
    this.touch();
  }

  disconnect(): void {
    this._status = IntegrationStatus.disconnected();
    this._accessToken = null;
    this._refreshToken = null;
    this._expiresAt = null;
    this._errorMessage = null;
    this.touch();
  }

  revoke(): void {
    this._status = IntegrationStatus.revoked();
    this._accessToken = null;
    this._refreshToken = null;
    this._expiresAt = null;
    this._errorMessage = null;
    this.touch();
  }

  updateSettings(settings: IntegrationSettings): void {
    this._settings = settings;
    this.touch();
  }

  changeExternalAccountId(externalAccountId: string | null): void {
    this._externalAccountId = externalAccountId?.trim() ?? null;
    this.touch();
  }

  changeScopes(scopes: string[]): void {
    this._scopes = [...scopes];
    this.touch();
  }

  recordSync(at: Date = new Date()): void {
    this._lastSyncedAt = at;
    this.touch(at);
  }

  toSnapshot(): UserIntegrationSnapshot {
    return {
      id: this.id.value,
      userId: this._userId.value,
      provider: this._provider,
      status: this._status.value,
      externalAccountId: this._externalAccountId,
      accessToken: this._accessToken,
      refreshToken: this._refreshToken,
      expiresAt: this._expiresAt,
      scopes: [...this._scopes],
      settings: this._settings,
      lastSyncedAt: this._lastSyncedAt,
      errorMessage: this._errorMessage,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
      deletedAt: this.deletedAt,
    };
  }
}

function parseProvider(provider: string): IntegrationProviderEnum {
  const normalized = provider.trim().toUpperCase();

  if (!isIntegrationProvider(normalized)) {
    throw new InvalidIntegrationProviderException(provider);
  }

  return normalized;
}
