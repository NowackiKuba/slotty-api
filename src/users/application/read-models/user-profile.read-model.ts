import type { Currency } from '@common/domain/enums';
import type { PaymentMethod, Sport } from '@users/domain/enums';
import type {
  LocationPointProps,
  PaymentDetailsProps,
} from '@users/domain/types';

export type UserProfileReadModel = {
  id: string;
  userId: string;
  sports: Sport[];
  nickname: string | null;
  bio: string | null;
  avatarUrl: string | null;
  places: LocationPointProps[];
  withTravel: boolean;
  pricePerSession: number;
  currency: Currency;
  sessionDurationMinutes: number;
  courtFeeIncluded: boolean;
  maxGroupSize: number | null;
  cancellationWindowHours: number | null;
  paymentMethods: PaymentMethod[];
  paymentDetails: PaymentDetailsProps | null;
  aiEnabled: boolean;
  autoConfirmBookings: boolean;
  aiCustomInstructions: string[];
  googleCalendarId: string | null;
  createdAt: Date;
  updatedAt: Date;
};
