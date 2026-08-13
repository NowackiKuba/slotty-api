import { Command } from '@common/application/cqrs';

export type SoftDeleteUserCommandPayload = {
  id: string;
};

export class SoftDeleteUserCommand extends Command<SoftDeleteUserCommandPayload> {
  constructor(payload: SoftDeleteUserCommandPayload) {
    super(payload);
  }
}
