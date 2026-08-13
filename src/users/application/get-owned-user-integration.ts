import type { IUserIntegrationRepository } from '@users/domain/repositories';
import { UserId } from '@users/domain/value-objects';
import {
  IntegrationProviderEnum,
  isIntegrationProvider,
} from '@users/domain/enums';
import {
  InvalidIntegrationProviderException,
  UserIntegrationNotFoundException,
} from '@users/domain/exceptions/integration';
import type { UserIntegration } from '@users/domain/aggregates';

export async function getOwnedUserIntegration(
  repository: IUserIntegrationRepository,
  userId: string,
  provider: string,
  options?: { includeDeleted?: boolean },
): Promise<UserIntegration> {
  const normalized = provider.trim().toUpperCase();

  if (!isIntegrationProvider(normalized)) {
    throw new InvalidIntegrationProviderException(provider);
  }

  const integration = options?.includeDeleted
    ? await repository.findByUserIdAndProviderIncludingDeleted(
        UserId.create(userId),
        normalized as IntegrationProviderEnum,
      )
    : await repository.findByUserIdAndProvider(
        UserId.create(userId),
        normalized as IntegrationProviderEnum,
      );

  if (!integration) {
    throw new UserIntegrationNotFoundException({ userId, provider: normalized });
  }

  return integration;
}
