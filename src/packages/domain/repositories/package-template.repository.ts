import type { PackageTemplate } from '@packages/domain/aggregates';

export interface IPackageTemplateRepository {
  findById(id: string): Promise<PackageTemplate | null>;
  findByIdIncludingDeleted(id: string): Promise<PackageTemplate | null>;
  listByUserId(userId: string): Promise<PackageTemplate[]>;
  save(template: PackageTemplate): Promise<void>;
}
