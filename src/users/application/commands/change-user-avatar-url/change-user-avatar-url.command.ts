import { Command } from '@common/application/cqrs';

export type ChangeUserAvatarUrlCommandPayload = {
  id: string;
  avatarUrl: string;
};

export class ChangeUserAvatarUrlCommand extends Command<ChangeUserAvatarUrlCommandPayload> {
  constructor(payload: ChangeUserAvatarUrlCommandPayload) {
    super(payload);
  }
}
