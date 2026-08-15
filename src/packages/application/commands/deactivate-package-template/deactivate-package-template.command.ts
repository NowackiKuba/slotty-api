import { Command } from '@common/application/cqrs';

export type DeactivatePackageTemplateCommandPayload = {
  userId: string;
  packageTemplateId: string;
};

export class DeactivatePackageTemplateCommand extends Command<DeactivatePackageTemplateCommandPayload> {
  constructor(payload: DeactivatePackageTemplateCommandPayload) {
    super(payload);
  }
}
