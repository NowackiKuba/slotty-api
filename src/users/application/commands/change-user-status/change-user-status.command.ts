import { Command } from '@common/application/cqrs';
import type { UserStatusValue } from '@users/domain/value-objects';

export type ChangeUserStatusCommandPayload = {
  id: string;
  status: UserStatusValue;
};

export class ChangeUserStatusCommand extends Command<ChangeUserStatusCommandPayload> {
  constructor(payload: ChangeUserStatusCommandPayload) {
    super(payload);
  }
}
