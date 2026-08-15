import { Inject } from '@nestjs/common';
import { CommandHandler, type ICommandHandler } from '@common/application/cqrs';
import { getOwnedPackageTemplate } from '@packages/application/get-owned-package-template';
import { PackageTemplateAlreadyDeletedException } from '@packages/domain/exceptions';
import type { IPackageTemplateRepository } from '@packages/domain/repositories';
import { PACKAGE_TEMPLATE_REPOSITORY } from '@packages/domain/tokens';
import { SoftDeletePackageTemplateCommand } from './soft-delete-package-template.command';

@CommandHandler(SoftDeletePackageTemplateCommand)
export class SoftDeletePackageTemplateHandler implements ICommandHandler<
  SoftDeletePackageTemplateCommand,
  string
> {
  constructor(
    @Inject(PACKAGE_TEMPLATE_REPOSITORY)
    private readonly packageTemplateRepository: IPackageTemplateRepository,
  ) {}

  async execute(command: SoftDeletePackageTemplateCommand): Promise<string> {
    const { userId, packageTemplateId } = command.payload;
    const template = await getOwnedPackageTemplate(
      this.packageTemplateRepository,
      packageTemplateId,
      userId,
      { includeDeleted: true },
    );

    if (template.isDeleted) {
      throw new PackageTemplateAlreadyDeletedException({
        packageTemplateId,
        userId,
      });
    }

    template.softDelete();
    await this.packageTemplateRepository.save(template);

    return packageTemplateId;
  }
}
