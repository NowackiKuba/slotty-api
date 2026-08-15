import { Inject } from '@nestjs/common';
import { CommandHandler, type ICommandHandler } from '@common/application/cqrs';
import { getOwnedPackageTemplate } from '@packages/application/get-owned-package-template';
import { PackageTemplateReadModelMapper } from '@packages/application/mappers';
import type { PackageTemplateReadModel } from '@packages/application/read-models';
import type { IPackageTemplateRepository } from '@packages/domain/repositories';
import { PACKAGE_TEMPLATE_REPOSITORY } from '@packages/domain/tokens';
import { ActivatePackageTemplateCommand } from './activate-package-template.command';

@CommandHandler(ActivatePackageTemplateCommand)
export class ActivatePackageTemplateHandler implements ICommandHandler<
  ActivatePackageTemplateCommand,
  PackageTemplateReadModel
> {
  constructor(
    private readonly mapper: PackageTemplateReadModelMapper,
    @Inject(PACKAGE_TEMPLATE_REPOSITORY)
    private readonly packageTemplateRepository: IPackageTemplateRepository,
  ) {}

  async execute(
    command: ActivatePackageTemplateCommand,
  ): Promise<PackageTemplateReadModel> {
    const { userId, packageTemplateId } = command.payload;
    const template = await getOwnedPackageTemplate(
      this.packageTemplateRepository,
      packageTemplateId,
      userId,
    );

    template.activate();
    await this.packageTemplateRepository.save(template);

    return this.mapper.toReadModel(template);
  }
}
