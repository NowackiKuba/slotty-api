import { Command } from '@common/application/cqrs';

export type CreateUserCommandPayload = {
  id: string;
  firstName: string;
  lastName: string;
  displayName: string;
  email: string;
  avatarUrl: string;
};

export class CreateUserCommand extends Command<CreateUserCommandPayload> {
  constructor(payload: CreateUserCommandPayload) {
    super(payload);
  }
}
