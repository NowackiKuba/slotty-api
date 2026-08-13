import { CustomerSource } from '@customers/domain/enums';
import { CustomerStatusValue } from '@customers/domain/value-objects';

export type CustomerReadModel = {
  id: string;
  userId: string;
  source: CustomerSource;
  firstName: string;
  lastName: string | null;
  nickname: string | null;
  avatarUrl: string | null;
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
};

export type CustomerWithFullDetailsReadModel = {
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
};
