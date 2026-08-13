import { Command } from '@common/application/cqrs';

export type ChangeCustomerNicknameCommandPayload = {
  userId: string;
  customerId: string;
  nickname: string | null;
};

export class ChangeCustomerNicknameCommand extends Command<ChangeCustomerNicknameCommandPayload> {
  constructor(payload: ChangeCustomerNicknameCommandPayload) {
    super(payload);
  }
}
