import { Currency } from '@common/domain/enums';
import { AggregateRoot } from '@common/domain';
import {
  isPaymentMethod,
  isSettlementType,
  isSport,
  SettlementType,
  type PaymentMethod,
  type Sport,
} from '@users/domain/enums';
import {
  InvalidPaymentMethodException,
  InvalidSettlementTypeException,
  InvalidSportException,
  InvalidUserProfileException,
} from '@users/domain/exceptions/profile';
import type {
  CreateUserProfileProps,
  LocationPointProps,
  PaymentDetailsProps,
  UserProfileProps,
  UserProfileSnapshot,
} from '@users/domain/types';
import {
  LocationPoint,
  PaymentDetails,
  SessionDuration,
  SessionPrice,
  UserId,
  UserProfileId,
} from '@users/domain/value-objects';

const MAX_NICKNAME_LENGTH = 40;
const MAX_BIO_LENGTH = 2000;
const MAX_GROUP_SIZE = 50;
const MAX_CANCELLATION_WINDOW_HOURS = 168;

export class UserProfile extends AggregateRoot<UserProfileId> {
  private _userId: UserId;
  private _sports: Sport[];
  private _nickname?: string;
  private _bio?: string;
  private _avatarUrl?: string;
  private _places: LocationPoint[];
  private _withTravel: boolean;
  private _sessionPrice: SessionPrice;
  private _sessionDuration: SessionDuration;
  private _courtFeeIncluded: boolean;
  private _maxGroupSize?: number;
  private _cancellationWindowHours?: number;
  private _settlementType: SettlementType;
  private _paymentMethods: PaymentMethod[];
  private _paymentDetails?: PaymentDetails;
  private _aiEnabled: boolean;
  private _autoConfirmBookings: boolean;
  private _aiCustomInstructions: string[];
  private _googleCalendarId?: string | null;

  private constructor(props: UserProfileProps) {
    super(props);
    this._userId = props.userId;
    this._sports = props.sports;
    this._nickname = props.nickname;
    this._bio = props.bio;
    this._avatarUrl = props.avatarUrl;
    this._places = props.places;
    this._withTravel = props.withTravel;
    this._sessionPrice = props.sessionPrice;
    this._sessionDuration = props.sessionDuration;
    this._courtFeeIncluded = props.courtFeeIncluded;
    this._maxGroupSize = props.maxGroupSize;
    this._cancellationWindowHours = props.cancellationWindowHours;
    this._settlementType = props.settlementType;
    this._paymentMethods = props.paymentMethods;
    this._paymentDetails = props.paymentDetails;
    this._aiEnabled = props.aiEnabled;
    this._autoConfirmBookings = props.autoConfirmBookings;
    this._aiCustomInstructions = props.aiCustomInstructions;
    this._googleCalendarId = props.googleCalendarId ?? null;
  }

  static create(props: CreateUserProfileProps): UserProfile {
    const profile = new UserProfile({
      id: UserProfileId.create(props.id),
      userId: UserId.create(props.userId),
      sports: parseSports(props.sports),
      nickname: optionalText(props.nickname, MAX_NICKNAME_LENGTH, 'nickname'),
      bio: optionalText(props.bio, MAX_BIO_LENGTH, 'bio'),
      avatarUrl: optionalText(props.avatarUrl, 2048, 'avatarUrl'),
      places: props.places.map((place) => LocationPoint.create(place)),
      withTravel: props.withTravel ?? false,
      sessionPrice: SessionPrice.create(
        props.pricePerSession,
        props.currency ?? Currency.PLN,
      ),
      sessionDuration: SessionDuration.create(props.sessionDurationMinutes),
      courtFeeIncluded: props.courtFeeIncluded ?? false,
      maxGroupSize: parseMaxGroupSize(props.maxGroupSize),
      cancellationWindowHours: parseCancellationWindow(
        props.cancellationWindowHours,
      ),
      settlementType: parseSettlementType(props.settlementType),
      paymentMethods: parsePaymentMethods(props.paymentMethods),
      paymentDetails: props.paymentDetails
        ? PaymentDetails.create(props.paymentDetails)
        : undefined,
      aiEnabled: props.aiEnabled ?? false,
      autoConfirmBookings: props.autoConfirmBookings ?? false,
      aiCustomInstructions: parseInstructions(props.aiCustomInstructions),
      googleCalendarId:
        optionalText(
          props.googleCalendarId ?? undefined,
          256,
          'googleCalendarId',
        ) ?? null,
    });

    profile.assertHasLocation();
    return profile;
  }

  static reconstitute(props: UserProfileProps): UserProfile {
    return new UserProfile(props);
  }

  get userId(): UserId {
    return this._userId;
  }

  get sports(): Sport[] {
    return [...this._sports];
  }

  get nickname(): string | undefined {
    return this._nickname;
  }

  get bio(): string | undefined {
    return this._bio;
  }

  get avatarUrl(): string | undefined {
    return this._avatarUrl;
  }

  get places(): LocationPoint[] {
    return [...this._places];
  }

  get withTravel(): boolean {
    return this._withTravel;
  }

  get sessionPrice(): SessionPrice {
    return this._sessionPrice;
  }

  get sessionDuration(): SessionDuration {
    return this._sessionDuration;
  }

  get courtFeeIncluded(): boolean {
    return this._courtFeeIncluded;
  }

  get maxGroupSize(): number | undefined {
    return this._maxGroupSize;
  }

  get cancellationWindowHours(): number | undefined {
    return this._cancellationWindowHours;
  }

  get settlementType(): SettlementType {
    return this._settlementType;
  }

  get paymentMethods(): PaymentMethod[] {
    return [...this._paymentMethods];
  }

  get paymentDetails(): PaymentDetails | undefined {
    return this._paymentDetails;
  }

  get aiEnabled(): boolean {
    return this._aiEnabled;
  }

  get autoConfirmBookings(): boolean {
    return this._autoConfirmBookings;
  }

  get aiCustomInstructions(): string[] {
    return [...this._aiCustomInstructions];
  }

  get googleCalendarId(): string | null {
    return this._googleCalendarId ?? null;
  }

  changeNickname(nickname?: string): void {
    this._nickname = optionalText(nickname, MAX_NICKNAME_LENGTH, 'nickname');
    this.touch();
  }

  changeBio(bio?: string): void {
    this._bio = optionalText(bio, MAX_BIO_LENGTH, 'bio');
    this.touch();
  }

  changeAvatarUrl(avatarUrl?: string): void {
    this._avatarUrl = optionalText(avatarUrl, 2048, 'avatarUrl');
    this.touch();
  }

  changeSports(sports: string[]): void {
    this._sports = parseSports(sports);
    this.touch();
  }

  changePlaces(places: LocationPointProps[]): void {
    this._places = places.map((place) => LocationPoint.create(place));
    this.assertHasLocation();
    this.touch();
  }

  changeWithTravel(withTravel: boolean): void {
    this._withTravel = withTravel;
    this.assertHasLocation();
    this.touch();
  }

  changeSessionPrice(amountMinor: number, currency?: string): void {
    this._sessionPrice = SessionPrice.create(
      amountMinor,
      currency ?? this._sessionPrice.currency,
    );
    this.touch();
  }

  changeSessionDuration(minutes: number): void {
    this._sessionDuration = SessionDuration.create(minutes);
    this.touch();
  }

  changeCourtFeeIncluded(included: boolean): void {
    this._courtFeeIncluded = included;
    this.touch();
  }

  changeMaxGroupSize(maxGroupSize: number | null): void {
    this._maxGroupSize = parseMaxGroupSize(maxGroupSize ?? undefined);
    this.touch();
  }

  changeCancellationWindow(hours: number | null): void {
    this._cancellationWindowHours = parseCancellationWindow(hours ?? undefined);
    this.touch();
  }

  changeSettlementType(type: string): void {
    this._settlementType = parseSettlementType(type);
    this.touch();
  }

  changePaymentMethods(methods: string[]): void {
    this._paymentMethods = parsePaymentMethods(methods);
    this.touch();
  }

  changePaymentDetails(details: PaymentDetailsProps | null): void {
    this._paymentDetails = details ? PaymentDetails.create(details) : undefined;
    this.touch();
  }

  changeAiEnabled(enabled: boolean): void {
    this._aiEnabled = enabled;
    this.touch();
  }

  changeAutoConfirmBookings(enabled: boolean): void {
    this._autoConfirmBookings = enabled;
    this.touch();
  }

  changeAiInstructions(instructions: string[]): void {
    this._aiCustomInstructions = parseInstructions(instructions);
    this.touch();
  }

  changeGoogleCalendarId(calendarId: string | null): void {
    this._googleCalendarId =
      optionalText(calendarId ?? undefined, 256, 'googleCalendarId') ?? null;
    this.touch();
  }

  toSnapshot(): UserProfileSnapshot {
    return {
      id: this.id.value,
      userId: this._userId.value,
      sports: [...this._sports],
      nickname: this._nickname ?? null,
      bio: this._bio ?? null,
      avatarUrl: this._avatarUrl ?? null,
      places: this._places.map((place) => place.toProps()),
      withTravel: this._withTravel,
      pricePerSession: this._sessionPrice.amountMinor,
      currency: this._sessionPrice.currency,
      sessionDurationMinutes: this._sessionDuration.minutes,
      courtFeeIncluded: this._courtFeeIncluded,
      maxGroupSize: this._maxGroupSize ?? null,
      cancellationWindowHours: this._cancellationWindowHours ?? null,
      settlementType: this._settlementType,
      paymentMethods: [...this._paymentMethods],
      paymentDetails: this._paymentDetails?.toProps() ?? null,
      aiEnabled: this._aiEnabled,
      autoConfirmBookings: this._autoConfirmBookings,
      aiCustomInstructions: [...this._aiCustomInstructions],
      googleCalendarId: this._googleCalendarId ?? null,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
      deletedAt: this.deletedAt,
    };
  }

  private assertHasLocation(): void {
    if (this._places.length === 0 && !this._withTravel) {
      throw new InvalidUserProfileException(
        'at least one place is required when travel is disabled',
      );
    }
  }
}

function parseSports(sports: string[]): Sport[] {
  if (sports.length === 0) {
    throw new InvalidUserProfileException('at least one sport is required');
  }

  const unique = new Set<Sport>();

  for (const sport of sports) {
    const normalized = sport.trim().toLowerCase();

    if (!isSport(normalized)) {
      throw new InvalidSportException(sport);
    }

    unique.add(normalized);
  }

  return [...unique];
}

function parseSettlementType(value?: string): SettlementType {
  if (!value) {
    return SettlementType.PER_SESSION;
  }

  const normalized = value.trim().toUpperCase();

  if (!isSettlementType(normalized)) {
    throw new InvalidSettlementTypeException(value);
  }

  return normalized;
}

function parsePaymentMethods(methods?: string[]): PaymentMethod[] {
  if (!methods?.length) {
    return [];
  }

  const unique = new Set<PaymentMethod>();

  for (const method of methods) {
    const normalized = method.trim().toUpperCase();

    if (!isPaymentMethod(normalized)) {
      throw new InvalidPaymentMethodException(method);
    }

    unique.add(normalized);
  }

  return [...unique];
}

function parseInstructions(instructions?: string[]): string[] {
  if (!instructions?.length) {
    return [];
  }

  return instructions
    .map((item) => item.trim())
    .filter((item) => item.length > 0);
}

function parseMaxGroupSize(value?: number): number | undefined {
  if (value === undefined) {
    return undefined;
  }

  if (!Number.isInteger(value) || value < 1 || value > MAX_GROUP_SIZE) {
    throw new InvalidUserProfileException('invalid max group size', {
      maxGroupSize: value,
    });
  }

  return value;
}

function parseCancellationWindow(value?: number): number | undefined {
  if (value === undefined) {
    return undefined;
  }

  if (
    !Number.isInteger(value) ||
    value < 0 ||
    value > MAX_CANCELLATION_WINDOW_HOURS
  ) {
    throw new InvalidUserProfileException('invalid cancellation window', {
      cancellationWindowHours: value,
    });
  }

  return value;
}

function optionalText(
  value: string | undefined,
  maxLength: number,
  field: string,
): string | undefined {
  if (value === undefined) {
    return undefined;
  }

  const trimmed = value.trim();

  if (!trimmed) {
    return undefined;
  }

  if (trimmed.length > maxLength) {
    throw new InvalidUserProfileException(`${field} is too long`, {
      field,
      maxLength,
    });
  }

  return trimmed;
}
