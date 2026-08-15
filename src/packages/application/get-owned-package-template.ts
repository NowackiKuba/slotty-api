import { PackageTemplate } from '@packages/domain/aggregates';
import {
  PackageTemplateAccessDeniedException,
  PackageTemplateNotFoundException,
} from '@packages/domain/exceptions';
import type { IPackageTemplateRepository } from '@packages/domain/repositories';
import { PackageTemplateId } from '@packages/domain/value-objects';

export async function getOwnedPackageTemplate(
  packageTemplateRepository: IPackageTemplateRepository,
  packageTemplateId: string,
  userId: string,
  options?: { includeDeleted?: boolean },
): Promise<PackageTemplate> {
  PackageTemplateId.create(packageTemplateId);

  const template = options?.includeDeleted
    ? await packageTemplateRepository.findByIdIncludingDeleted(
        packageTemplateId,
      )
    : await packageTemplateRepository.findById(packageTemplateId);

  if (!template) {
    throw new PackageTemplateNotFoundException({ packageTemplateId, userId });
  }

  if (template.userId.value !== userId) {
    throw new PackageTemplateAccessDeniedException({
      packageTemplateId,
      userId,
    });
  }

  return template;
}
