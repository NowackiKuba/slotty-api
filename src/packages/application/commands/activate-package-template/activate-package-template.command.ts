import { Command } from '@common/application/cqrs';

export type ActivatePackageTemplateCommandPayload = {
  userId: string;
  packageTemplateId: string;
};

export class ActivatePackageTemplateCommand extends Command<ActivatePackageTemplateCommandPayload> {
  constructor(payload: ActivatePackageTemplateCommandPayload) {
    super(payload);
  }
}
