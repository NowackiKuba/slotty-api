import { Command } from '@common/application/cqrs';
import { CustomerSource } from '@customers/domain/enums';

export type CreateCustomerCommandPayload = {
  userId: string;
  source: CustomerSource;
  firstName: string;
  lastName: string | null;
  nickname: string | null;
  email: string | null;
  phoneNumber: string | null;
  avatarUrl: string | null;
  instagramAccountId: string | null;
  whatsappAccountId: string | null;
};

export class CreateCustomerCommand extends Command<CreateCustomerCommandPayload> {
  constructor(payload: CreateCustomerCommandPayload) {
    super(payload);
  }
}
