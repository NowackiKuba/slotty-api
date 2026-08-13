import { Command } from '@common/application/cqrs';

export type VerifyUserEmailCommandPayload = {
  id: string;
};

export class VerifyUserEmailCommand extends Command<VerifyUserEmailCommandPayload> {
  constructor(payload: VerifyUserEmailCommandPayload) {
    super(payload);
  }
}
