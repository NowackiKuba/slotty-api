import { Command } from '@common/application/cqrs';

export type CreatePackageTemplateCommandPayload = {
  userId: string;
  name: string;
  description?: string;
  sessionCount: number;
  price: number;
  currency?: string;
  validityDays?: number | null;
  isActive?: boolean;
};

export class CreatePackageTemplateCommand extends Command<CreatePackageTemplateCommandPayload> {
  constructor(payload: CreatePackageTemplateCommandPayload) {
    super(payload);
  }
}
