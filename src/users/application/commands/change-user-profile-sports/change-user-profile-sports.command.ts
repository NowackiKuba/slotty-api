import { Command } from '@common/application/cqrs';

export type ChangeUserProfileSportsCommandPayload = {
  userId: string;
  sports: string[];
};

export class ChangeUserProfileSportsCommand extends Command<ChangeUserProfileSportsCommandPayload> {
  constructor(payload: ChangeUserProfileSportsCommandPayload) {
    super(payload);
  }
}
