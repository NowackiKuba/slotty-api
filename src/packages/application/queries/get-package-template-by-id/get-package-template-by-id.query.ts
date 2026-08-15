import { Query } from '@common/application/cqrs';
import type { PackageTemplateReadModel } from '@packages/application/read-models';

export type GetPackageTemplateByIdPayload = {
  userId: string;
  packageTemplateId: string;
};

export class GetPackageTemplateByIdQuery extends Query<
  GetPackageTemplateByIdPayload,
  PackageTemplateReadModel
> {
  constructor(payload: GetPackageTemplateByIdPayload) {
    super(payload);
  }
}
