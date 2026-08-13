import { Command } from '@common/application/cqrs';

export type ChangeUserDisplayNameCommandPayload = {
  id: string;
  displayName: string;
};

export class ChangeUserDisplayNameCommand extends Command<ChangeUserDisplayNameCommandPayload> {
  constructor(payload: ChangeUserDisplayNameCommandPayload) {
    super(payload);
  }
}
