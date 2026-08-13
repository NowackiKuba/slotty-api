import { Command } from '@common/application/cqrs';

export type ChangeCustomerTrainingNotesCommandPayload = {
  userId: string;
  customerId: string;
  equipmentToBring?: string[];
  focusAreas?: string[];
  healthNotes?: string | null;
  generalNotes?: string | null;
};

export class ChangeCustomerTrainingNotesCommand extends Command<ChangeCustomerTrainingNotesCommandPayload> {
  constructor(payload: ChangeCustomerTrainingNotesCommandPayload) {
    super(payload);
  }
}
