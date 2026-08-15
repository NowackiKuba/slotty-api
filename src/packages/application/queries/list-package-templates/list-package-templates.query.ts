import { Query } from '@common/application/cqrs';
import type { PackageTemplateReadModel } from '@packages/application/read-models';

export type ListPackageTemplatesQueryPayload = {
  userId: string;
};

export class ListPackageTemplatesQuery extends Query<
  ListPackageTemplatesQueryPayload,
  PackageTemplateReadModel[]
> {
  constructor(payload: ListPackageTemplatesQueryPayload) {
    super(payload);
  }
}
