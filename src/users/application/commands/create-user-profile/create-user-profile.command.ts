import { Command } from '@common/application/cqrs';
import type {
  LocationPointProps,
  PaymentDetailsProps,
} from '@users/domain/types';

export type CreateUserProfileCommandPayload = {
  userId: string;
  sports: string[];
  nickname?: string;
  bio?: string;
  avatarUrl?: string;
  places: LocationPointProps[];
  withTravel?: boolean;
  pricePerSession: number;
  currency?: string;
  sessionDurationMinutes: number;
  courtFeeIncluded?: boolean;
  maxGroupSize?: number;
  cancellationWindowHours?: number;
  settlementType?: string;
  paymentMethods?: string[];
  paymentDetails?: PaymentDetailsProps;
  aiEnabled?: boolean;
  autoConfirmBookings?: boolean;
  aiCustomInstructions?: string[];
  googleCalendarId?: string | null;
};

export class CreateUserProfileCommand extends Command<CreateUserProfileCommandPayload> {
  constructor(payload: CreateUserProfileCommandPayload) {
    super(payload);
  }
}
