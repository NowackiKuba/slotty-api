import { Command } from '@common/application/cqrs';

export type ChangeUserProfilePricingCommandPayload = {
  userId: string;
  pricePerSession?: number;
  currency?: string;
  sessionDurationMinutes?: number;
  courtFeeIncluded?: boolean;
  maxGroupSize?: number | null;
};

export class ChangeUserProfilePricingCommand extends Command<ChangeUserProfilePricingCommandPayload> {
  constructor(payload: ChangeUserProfilePricingCommandPayload) {
    super(payload);
  }
}
