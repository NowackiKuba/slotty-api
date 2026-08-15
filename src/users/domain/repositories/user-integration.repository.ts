import type { UserIntegration } from '@users/domain/aggregates';
import type { IntegrationProviderEnum } from '@users/domain/enums';
import type { UserId, UserIntegrationId } from '@users/domain/value-objects';

export interface IUserIntegrationRepository {
  findById(id: UserIntegrationId): Promise<UserIntegration | null>;
  findByIdIncludingDeleted(
    id: UserIntegrationId,
  ): Promise<UserIntegration | null>;
  findByUserIdAndProvider(
    userId: UserId,
    provider: IntegrationProviderEnum,
  ): Promise<UserIntegration | null>;
  listByUserId(userId: UserId): Promise<UserIntegration[]>;
  findByUserIdAndProviderIncludingDeleted(
    userId: UserId,
    provider: IntegrationProviderEnum,
  ): Promise<UserIntegration | null>;
  findUsableByProviderAndAccountIds(
    provider: IntegrationProviderEnum,
    accountIds: string[],
  ): Promise<UserIntegration | null>;
  save(integration: UserIntegration): Promise<void>;
}
