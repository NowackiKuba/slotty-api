import { Command } from '@common/application/cqrs';

export type RenameUserCommandPayload = {
  id: string;
  firstName: string;
  lastName: string;
};

export class RenameUserCommand extends Command<RenameUserCommandPayload> {
  constructor(payload: RenameUserCommandPayload) {
    super(payload);
  }
}
