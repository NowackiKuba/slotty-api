import { Command } from '@common/application/cqrs';
import type { SubscriptionStatusValue } from '@users/domain/value-objects';

export type ChangeUserSubscriptionStatusCommandPayload = {
  userId: string;
  subscriptionStatus: SubscriptionStatusValue;
};

export class ChangeUserSubscriptionStatusCommand extends Command<ChangeUserSubscriptionStatusCommandPayload> {
  constructor(payload: ChangeUserSubscriptionStatusCommandPayload) {
    super(payload);
  }
}
