import type { AggregateRootProps } from '@common/domain';
import type { CustomerSource } from '@customers/domain/enums';
import type {
  CustomerId,
  CustomerStatus,
  CustomerStatusValue,
} from '@customers/domain/value-objects';
import type { UserId } from '@users/domain/value-objects';

export type CreateCustomerProps = {
  id?: string;
  userId: string;
  source: string;
  firstName: string;
  lastName?: string;
  nickname?: string;
  email?: string;
  phoneNumber?: string;
  avatarUrl?: string;
  instagramAccountId?: string;
  whatsappAccountId?: string;
  equipmentToBring?: string[];
  focusAreas?: string[];
  healthNotes?: string;
  generalNotes?: string;
  status?: string;
  aiOptOut?: boolean;
  preferredLanguage?: string;
};

export type CustomerProps = AggregateRootProps<CustomerId> & {
  userId: UserId;
  source: CustomerSource;
  firstName: string;
  lastName?: string;
  nickname?: string;
  email?: string;
  phoneNumber?: string;
  avatarUrl?: string;
  instagramAccountId?: string;
  whatsappAccountId?: string;
  equipmentToBring: string[];
  focusAreas: string[];
  healthNotes?: string;
  generalNotes?: string;
  status: CustomerStatus;
  aiOptOut: boolean;
  preferredLanguage: string;
  totalSessionsCount: number;
  noShowCount: number;
};

export type CustomerSnapshot = {
  id: string;
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
  equipmentToBring: string[];
  focusAreas: string[];
  healthNotes: string | null;
  generalNotes: string | null;
  status: CustomerStatusValue;
  aiOptOut: boolean;
  preferredLanguage: string;
  totalSessionsCount: number;
  noShowCount: number;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
};
