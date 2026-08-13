import { Command } from '@common/application/cqrs';

export type SoftDeleteUserProfileCommandPayload = {
  userId: string;
};

export class SoftDeleteUserProfileCommand extends Command<SoftDeleteUserProfileCommandPayload> {
  constructor(payload: SoftDeleteUserProfileCommandPayload) {
    super(payload);
  }
}
