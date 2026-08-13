import type { Currency } from '@common/domain/enums';
import type { AggregateRootProps } from '@common/domain';
import type { PaymentMethod, Sport } from '@users/domain/enums';
import type {
  LocationPoint,
  LocationPointProps,
  PaymentDetails,
  PaymentDetailsProps,
  SessionDuration,
  SessionPrice,
  UserId,
  UserProfileId,
} from '@users/domain/value-objects';

export type { BankDetailsProps } from '@users/domain/value-objects';
export type { LocationPointProps, PaymentDetailsProps };

export type CreateUserProfileProps = {
  id?: string;
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
  paymentMethods?: string[];
  paymentDetails?: PaymentDetailsProps;
  aiEnabled?: boolean;
  autoConfirmBookings?: boolean;
  aiCustomInstructions?: string[];
  googleCalendarId?: string | null;
};

export type UserProfileProps = AggregateRootProps<UserProfileId> & {
  userId: UserId;
  sports: Sport[];
  nickname?: string;
  bio?: string;
  avatarUrl?: string;
  places: LocationPoint[];
  withTravel: boolean;
  sessionPrice: SessionPrice;
  sessionDuration: SessionDuration;
  courtFeeIncluded: boolean;
  maxGroupSize?: number;
  cancellationWindowHours?: number;
  paymentMethods: PaymentMethod[];
  paymentDetails?: PaymentDetails;
  aiEnabled: boolean;
  autoConfirmBookings: boolean;
  aiCustomInstructions: string[];
  googleCalendarId?: string | null;
};

export type UserProfileSnapshot = {
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
  deletedAt: Date | null;
};
