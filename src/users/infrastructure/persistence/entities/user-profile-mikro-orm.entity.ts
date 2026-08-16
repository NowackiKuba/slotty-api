import { BaseEntity } from '@database/base.entity';
import { UserMikroOrmEntity } from './user-mikro-orm.entity';
import { Entity, Enum, OneToOne, Property } from '@mikro-orm/core';
import type {
  LocationPointProps,
  PaymentDetailsProps,
} from '@users/domain/types';
import { Currency } from '@common/domain/enums';
import { generateUUID } from '@common/uuid';
import { SettlementType } from '@users/domain/enums';

export type UserProfileMikroOrmEntityProps = {
  id?: string;
  user: UserMikroOrmEntity;
  sports: string[]; // Użyj tablicy! Trener może uczyć Tenisa i Padla jednocześnie
  nickname?: string;
  bio?: string;
  avatarUrl?: string; // Jeśli inny niż główny avatar usera
  places: LocationPointProps[]; // Rozbudowany obiekt lokalizacji
  withTravel?: boolean; // Czy dojeżdża do klienta
  pricePerSession: number; // Cena w groszach/centach (np. 15000 = 150.00 PLN - unikaj floatów!)
  currency?: Currency; // default: 'PLN'
  sessionDurationMinutes: number; // np. 60
  courtFeeIncluded?: boolean; // Czy cena zawiera kort (bardzo ważne w tenisie/padlu)
  maxGroupSize?: number; // np. 1 (personalny), 4 (padel)
  cancellationWindowHours?: number; // np. 24 (godziny przed treningiem)
  settlementType?: SettlementType; // default: PER_SESSION
  paymentMethods?: string[]; // ['BLIK', 'BANK_TRANSFER', 'CASH']
  paymentDetails?: PaymentDetailsProps;
  aiEnabled?: boolean; // Włączony/Wyłączony bot AI
  autoConfirmBookings?: boolean; // Czy automatem wpisuje w kalendarz, czy czeka na klik trenera
  aiCustomInstructions?: string[]; // Customowy prompt/instrukcje dla bota
  googleCalendarId?: string | null; // ID spiętego kalendarza
  createdAt?: Date;
  updatedAt?: Date;
  deletedAt?: Date | null;
};

@Entity({ tableName: 'user_profiles' })
export class UserProfileMikroOrmEntity
  extends BaseEntity
  implements UserProfileMikroOrmEntityProps
{
  @OneToOne(() => UserMikroOrmEntity, { owner: true, fieldName: 'user_id' })
  user: UserMikroOrmEntity;

  @Property({ type: 'jsonb' })
  sports: string[];
  @Property({ type: 'text', nullable: true })
  nickname?: string;
  @Property({ type: 'text', nullable: true })
  bio?: string;
  @Property({ type: 'text', nullable: true })
  avatarUrl?: string;
  @Property({ type: 'jsonb' })
  places: LocationPointProps[];
  @Property({ type: 'boolean', default: false })
  withTravel?: boolean;

  @Property({ type: 'integer' })
  pricePerSession: number;
  @Enum({
    items: () => Currency,
    default: 'PLN',
  })
  currency: Currency;
  @Property({ type: 'integer' })
  sessionDurationMinutes: number;
  @Property({ type: 'boolean', default: false })
  courtFeeIncluded: boolean;
  @Property({ type: 'integer', nullable: true })
  maxGroupSize?: number;

  @Property({ type: 'integer', nullable: true })
  cancellationWindowHours?: number;
  @Enum({
    items: () => SettlementType,
    default: SettlementType.PER_SESSION,
  })
  settlementType: SettlementType;
  @Property({ type: 'jsonb', nullable: true })
  paymentMethods?: string[];
  @Property({ type: 'jsonb', nullable: true })
  paymentDetails?: PaymentDetailsProps;

  @Property({ type: 'boolean', nullable: true })
  aiEnabled?: boolean;
  @Property({ type: 'boolean', default: false })
  autoConfirmBookings: boolean;
  @Property({ type: 'jsonb', nullable: true })
  aiCustomInstructions?: string[];
  @Property({ type: 'text', nullable: true })
  googleCalendarId?: string | null;

  constructor(props: UserProfileMikroOrmEntityProps) {
    super();
    this.id = props.id ?? generateUUID();
    this.user = props.user;
    this.sports = props.sports;
    this.nickname = props.nickname;
    this.bio = props.bio;
    this.avatarUrl = props.avatarUrl;
    this.places = props.places;
    this.withTravel = props.withTravel;
    this.pricePerSession = props.pricePerSession;
    this.currency = props.currency ?? Currency.PLN;
    this.sessionDurationMinutes = props.sessionDurationMinutes;
    this.courtFeeIncluded = props.courtFeeIncluded ?? false;
    this.maxGroupSize = props.maxGroupSize;
    this.cancellationWindowHours = props.cancellationWindowHours;
    this.settlementType = props.settlementType ?? SettlementType.PER_SESSION;
    this.paymentMethods = props.paymentMethods;
    this.paymentDetails = props.paymentDetails;
    this.aiEnabled = props.aiEnabled;
    this.autoConfirmBookings = props.autoConfirmBookings ?? false;
    this.aiCustomInstructions = props.aiCustomInstructions;
    this.googleCalendarId = props.googleCalendarId;
    if (props.createdAt) this.createdAt = props.createdAt;
    if (props.updatedAt) this.updatedAt = props.updatedAt;
    this.deletedAt = props.deletedAt;
  }
}
