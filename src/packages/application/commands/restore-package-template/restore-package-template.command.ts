import { Command } from '@common/application/cqrs';

export type RestorePackageTemplateCommandPayload = {
  userId: string;
  packageTemplateId: string;
};

export class RestorePackageTemplateCommand extends Command<RestorePackageTemplateCommandPayload> {
  constructor(payload: RestorePackageTemplateCommandPayload) {
    super(payload);
  }
}
