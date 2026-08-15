import { Command } from '@common/application/cqrs';

export type UpdatePackageTemplateCommandPayload = {
  userId: string;
  packageTemplateId: string;
  name?: string;
  description?: string | null;
  sessionCount?: number;
  price?: number;
  currency?: string;
  validityDays?: number | null;
  isActive?: boolean;
};

export class UpdatePackageTemplateCommand extends Command<UpdatePackageTemplateCommandPayload> {
  constructor(payload: UpdatePackageTemplateCommandPayload) {
    super(payload);
  }
}
