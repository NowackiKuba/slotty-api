import { Command } from '@common/application/cqrs';

export type SoftDeletePackageTemplateCommandPayload = {
  userId: string;
  packageTemplateId: string;
};

export class SoftDeletePackageTemplateCommand extends Command<SoftDeletePackageTemplateCommandPayload> {
  constructor(payload: SoftDeletePackageTemplateCommandPayload) {
    super(payload);
  }
}
