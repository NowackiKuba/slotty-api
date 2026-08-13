import { Query } from '@common/application/cqrs';
import type { UserIntegrationReadModel } from '@users/application/read-models';

export type GetUserIntegrationByProviderQueryPayload = {
  userId: string;
  provider: string;
};

export class GetUserIntegrationByProviderQuery extends Query<
  GetUserIntegrationByProviderQueryPayload,
  UserIntegrationReadModel
> {
  constructor(payload: GetUserIntegrationByProviderQueryPayload) {
    super(payload);
  }
}
