import { Command } from '@common/application/cqrs';

export type ChangeUserProfileDetailsCommandPayload = {
  userId: string;
  nickname?: string;
  bio?: string;
  avatarUrl?: string;
};

export class ChangeUserProfileDetailsCommand extends Command<ChangeUserProfileDetailsCommandPayload> {
  constructor(payload: ChangeUserProfileDetailsCommandPayload) {
    super(payload);
  }
}
