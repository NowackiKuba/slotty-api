import { Inject } from '@nestjs/common';
import { QueryHandler, type IQueryHandler } from '@common/application/cqrs';
import { getOwnedPackageTemplate } from '@packages/application/get-owned-package-template';
import { PackageTemplateReadModelMapper } from '@packages/application/mappers';
import type { PackageTemplateReadModel } from '@packages/application/read-models';
import type { IPackageTemplateRepository } from '@packages/domain/repositories';
import { PACKAGE_TEMPLATE_REPOSITORY } from '@packages/domain/tokens';
import { GetPackageTemplateByIdQuery } from './get-package-template-by-id.query';

@QueryHandler(GetPackageTemplateByIdQuery)
export class GetPackageTemplateByIdHandler implements IQueryHandler<
  GetPackageTemplateByIdQuery,
  PackageTemplateReadModel
> {
  constructor(
    private readonly mapper: PackageTemplateReadModelMapper,
    @Inject(PACKAGE_TEMPLATE_REPOSITORY)
    private readonly packageTemplateRepository: IPackageTemplateRepository,
  ) {}

  async execute(
    query: GetPackageTemplateByIdQuery,
  ): Promise<PackageTemplateReadModel> {
    const { userId, packageTemplateId } = query.payload;
    const template = await getOwnedPackageTemplate(
      this.packageTemplateRepository,
      packageTemplateId,
      userId,
    );

    return this.mapper.toReadModel(template);
  }
}
