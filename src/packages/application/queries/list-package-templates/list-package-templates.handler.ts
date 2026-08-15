import { Inject } from '@nestjs/common';
import { QueryHandler, type IQueryHandler } from '@common/application/cqrs';
import { PackageTemplateReadModelMapper } from '@packages/application/mappers';
import type { PackageTemplateReadModel } from '@packages/application/read-models';
import type { IPackageTemplateRepository } from '@packages/domain/repositories';
import { PACKAGE_TEMPLATE_REPOSITORY } from '@packages/domain/tokens';
import { ListPackageTemplatesQuery } from './list-package-templates.query';

@QueryHandler(ListPackageTemplatesQuery)
export class ListPackageTemplatesHandler implements IQueryHandler<
  ListPackageTemplatesQuery,
  PackageTemplateReadModel[]
> {
  constructor(
    private readonly mapper: PackageTemplateReadModelMapper,
    @Inject(PACKAGE_TEMPLATE_REPOSITORY)
    private readonly packageTemplateRepository: IPackageTemplateRepository,
  ) {}

  async execute(
    query: ListPackageTemplatesQuery,
  ): Promise<PackageTemplateReadModel[]> {
    const templates = await this.packageTemplateRepository.listByUserId(
      query.payload.userId,
    );

    return templates
      .filter((template) => template.isActive)
      .map((template) => this.mapper.toReadModel(template));
  }
}
