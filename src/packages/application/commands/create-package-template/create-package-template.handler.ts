import { Inject } from '@nestjs/common';
import { CommandHandler, type ICommandHandler } from '@common/application/cqrs';
import { PackageTemplateReadModelMapper } from '@packages/application/mappers';
import type { PackageTemplateReadModel } from '@packages/application/read-models';
import { PackageTemplate } from '@packages/domain/aggregates';
import type { IPackageTemplateRepository } from '@packages/domain/repositories';
import { PACKAGE_TEMPLATE_REPOSITORY } from '@packages/domain/tokens';
import { CreatePackageTemplateCommand } from './create-package-template.command';

@CommandHandler(CreatePackageTemplateCommand)
export class CreatePackageTemplateHandler implements ICommandHandler<
  CreatePackageTemplateCommand,
  PackageTemplateReadModel
> {
  constructor(
    private readonly mapper: PackageTemplateReadModelMapper,
    @Inject(PACKAGE_TEMPLATE_REPOSITORY)
    private readonly packageTemplateRepository: IPackageTemplateRepository,
  ) {}

  async execute(
    command: CreatePackageTemplateCommand,
  ): Promise<PackageTemplateReadModel> {
    const template = PackageTemplate.create(command.payload);
    await this.packageTemplateRepository.save(template);

    return this.mapper.toReadModel(template);
  }
}
