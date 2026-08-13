import { Command } from '@common/application/cqrs';

export type RestoreUserCommandPayload = {
  id: string;
};

export class RestoreUserCommand extends Command<RestoreUserCommandPayload> {
  constructor(payload: RestoreUserCommandPayload) {
    super(payload);
  }
}
