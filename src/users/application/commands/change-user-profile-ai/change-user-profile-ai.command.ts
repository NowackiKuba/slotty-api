import { Command } from '@common/application/cqrs';

export type ChangeUserProfileAiCommandPayload = {
  userId: string;
  aiEnabled?: boolean;
  autoConfirmBookings?: boolean;
  aiCustomInstructions?: string[];
  googleCalendarId?: string | null;
};

export class ChangeUserProfileAiCommand extends Command<ChangeUserProfileAiCommandPayload> {
  constructor(payload: ChangeUserProfileAiCommandPayload) {
    super(payload);
  }
}
