import { Query } from '@common/application/cqrs';
import type { UserIntegrationReadModel } from '@users/application/read-models';

export type ListUserIntegrationsQueryPayload = {
  userId: string;
};

export class ListUserIntegrationsQuery extends Query<
  ListUserIntegrationsQueryPayload,
  UserIntegrationReadModel[]
> {
  constructor(payload: ListUserIntegrationsQueryPayload) {
    super(payload);
  }
}
