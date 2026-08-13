import { Command } from '@common/application/cqrs';

export type ChangeCustomerAvatarUrlCommandPayload = {
  userId: string;
  customerId: string;
  avatarUrl: string | null;
};

export class ChangeCustomerAvatarUrlCommand extends Command<ChangeCustomerAvatarUrlCommandPayload> {
  constructor(payload: ChangeCustomerAvatarUrlCommandPayload) {
    super(payload);
  }
}
