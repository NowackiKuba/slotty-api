import { Inject } from '@nestjs/common';
import { CommandHandler, type ICommandHandler } from '@common/application/cqrs';
import { getOwnedPackageTemplate } from '@packages/application/get-owned-package-template';
import { PackageTemplateReadModelMapper } from '@packages/application/mappers';
import type { PackageTemplateReadModel } from '@packages/application/read-models';
import type { IPackageTemplateRepository } from '@packages/domain/repositories';
import { PACKAGE_TEMPLATE_REPOSITORY } from '@packages/domain/tokens';
import { RestorePackageTemplateCommand } from './restore-package-template.command';

@CommandHandler(RestorePackageTemplateCommand)
export class RestorePackageTemplateHandler implements ICommandHandler<
  RestorePackageTemplateCommand,
  PackageTemplateReadModel
> {
  constructor(
    private readonly mapper: PackageTemplateReadModelMapper,
    @Inject(PACKAGE_TEMPLATE_REPOSITORY)
    private readonly packageTemplateRepository: IPackageTemplateRepository,
  ) {}

  async execute(
    command: RestorePackageTemplateCommand,
  ): Promise<PackageTemplateReadModel> {
    const { userId, packageTemplateId } = command.payload;
    const template = await getOwnedPackageTemplate(
      this.packageTemplateRepository,
      packageTemplateId,
      userId,
      { includeDeleted: true },
    );

    template.restore();
    await this.packageTemplateRepository.save(template);

    return this.mapper.toReadModel(template);
  }
}
