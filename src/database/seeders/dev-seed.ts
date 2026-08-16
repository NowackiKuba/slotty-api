/**
 * Dev seeder — fills one trainer account with a realistic, large dataset so the
 * mobile app can be browsed with something other than empty states.
 *
 * Run:  npm run seed:dev
 *       npm run seed:dev -- --user=<uuid> --customers=60 --months-back=9 --seed=7
 *
 * It replaces that user's data (customers, events, messages, packages,
 * broadcasts, integrations) by default; pass `--keep` to append instead.
 * It refuses to run with NODE_ENV=production.
 */
import 'dotenv/config';

import { Currency } from '@common/domain/enums';
import { CustomerSource } from '@customers/domain/enums';
import { CustomerStatusEnum } from '@customers/domain/value-objects';
import { CustomerMikroOrmEntity } from '@customers/infrastructure/persistence/entities';
import {
  BroadcastRecipientStatusEnum,
  BroadcastStatusEnum,
} from '@broadcasts/domain/enums';
import {
  BroadcastMikroOrmEntity,
  BroadcastRecipientMikroOrmEntity,
} from '@broadcasts/infrastructure/persistence/entities';
import { EventSource, EventType } from '@events/domain/enums';
import { EventStatusEnum } from '@events/domain/value-objects';
import { EventMikroOrmEntity } from '@events/infrastructure/persistence/entities';
import { MessageChannel, MessageSender } from '@messages/domain/enums';
import { MessageMikroOrmEntity } from '@messages/infrastructure/persistence/entities';
import { CustomerPackageStatusEnum } from '@packages/domain/enums';
import {
  CustomerPackageMikroOrmEntity,
  PackageTemplateMikroOrmEntity,
} from '@packages/infrastructure/persistence/entities';
import {
  IntegrationProviderEnum,
  IntegrationStatusEnum,
  PaymentMethod,
  SettlementType,
  Sport,
} from '@users/domain/enums';
import {
  UserIntegrationMikroOrmEntity,
  UserMikroOrmEntity,
  UserProfileMikroOrmEntity,
  UserWorkingHoursMikroOrmEntity,
} from '@users/infrastructure/persistence/entities';
import { MikroORM, type EntityManager } from '@mikro-orm/postgresql';

import ormConfig from '../mikro-orm.config';
import {
  AI_INSTRUCTIONS,
  BOT_REPLIES,
  BROADCAST_TEXTS,
  CUSTOMER_FOLLOWUPS,
  CUSTOMER_OPENERS,
  EQUIPMENT,
  FIRST_NAMES_FEMALE,
  FIRST_NAMES_MALE,
  FOCUS_AREAS,
  GENERAL_NOTES,
  HEALTH_NOTES,
  LAST_NAMES,
  NICKNAMES,
  PERSONAL_BLOCK_TITLES,
  POST_SESSION_NOTES,
  SESSION_PLANS,
  TRAINER_REPLIES,
  TRAINING_PLACES,
} from './fixtures';
import { Random } from './random';
import {
  addDays,
  addMinutes,
  eachDay,
  isoDayOfWeek,
  parseHourMinute,
  zonedToUtc,
} from './time';

const DEFAULT_USER_ID = '004486ad-da7f-4207-89d0-53e7079f3a64';
const TIMEZONE = 'Europe/Warsaw';
const SESSION_MINUTES = 60;

type Options = {
  userId: string;
  customerCount: number;
  monthsBack: number;
  monthsForward: number;
  seed: number;
  wipe: boolean;
};

function parseOptions(argv: string[]): Options {
  const flags = new Map<string, string>();

  for (const arg of argv) {
    const match = /^--([\w-]+)(?:=(.*))?$/.exec(arg);
    if (match) flags.set(match[1], match[2] ?? 'true');
  }

  const number = (key: string, fallback: number): number => {
    const raw = flags.get(key);
    if (raw === undefined) return fallback;
    const parsed = Number(raw);
    if (!Number.isFinite(parsed)) {
      throw new Error(`--${key} must be a number, got "${raw}"`);
    }
    return parsed;
  };

  return {
    userId: flags.get('user') ?? DEFAULT_USER_ID,
    customerCount: number('customers', 48),
    monthsBack: number('months-back', 7),
    monthsForward: number('months-forward', 2),
    seed: number('seed', 20260816),
    wipe: !flags.has('keep'),
  };
}

/** Deletes only this user's rows, children first. */
async function wipeUserData(
  orm: MikroORM,
  userId: string,
): Promise<Record<string, number>> {
  const connection = orm.em.getConnection();
  const deleted: Record<string, number> = {};

  const statements: [string, string][] = [
    [
      'broadcast_recipients',
      `delete from broadcast_recipients where broadcast_id in (select id from broadcasts where user_id = ?)`,
    ],
    ['broadcasts', `delete from broadcasts where user_id = ?`],
    ['messages', `delete from messages where user_id = ?`],
    ['customer_packages', `delete from customer_packages where user_id = ?`],
    ['package_templates', `delete from package_templates where user_id = ?`],
    ['events', `delete from events where user_id = ?`],
    ['customers', `delete from customers where user_id = ?`],
    ['user_integrations', `delete from user_integrations where user_id = ?`],
  ];

  for (const [table, sql] of statements) {
    const result = await connection.execute(sql, [userId], 'run');
    deleted[table] = (result as { affectedRows?: number }).affectedRows ?? 0;
  }

  return deleted;
}

function buildProfile(
  em: EntityManager,
  user: UserMikroOrmEntity,
  existing: UserProfileMikroOrmEntity | null,
): UserProfileMikroOrmEntity {
  const values = {
    sports: [Sport.TENNIS, Sport.PADEL] as string[],
    nickname: 'Kamil "Kicker" Wiernek',
    bio: 'Trener tenisa z licencją PZT, 12 lat na korcie. Specjalizuję się w serwisie i grze przy siatce. Padel prowadzę w hali na Mokotowie.',
    places: TRAINING_PLACES,
    withTravel: true,
    pricePerSession: 15000,
    currency: Currency.PLN,
    sessionDurationMinutes: SESSION_MINUTES,
    courtFeeIncluded: true,
    maxGroupSize: 4,
    cancellationWindowHours: 24,
    settlementType: SettlementType.PER_SESSION,
    paymentMethods: [
      PaymentMethod.BLIK,
      PaymentMethod.BANK_TRANSFER,
      PaymentMethod.CASH,
    ] as string[],
    paymentDetails: {
      blikPhone: '601234567',
      bank: {
        account: 'PL61109010140000071219812874',
        recipient: 'Kamil Wiernek Tenis',
        titleTemplate: 'Trening {date} — {customer}',
      },
    },
    aiEnabled: true,
    autoConfirmBookings: true,
    aiCustomInstructions: [...AI_INSTRUCTIONS],
    googleCalendarId: 'primary',
  };

  if (existing) {
    Object.assign(existing, values);
    return existing;
  }

  const profile = new UserProfileMikroOrmEntity({ user, ...values });
  em.persist(profile);

  return profile;
}

const WORKING_HOURS: Record<
  number,
  { start: string; end: string; off: boolean }
> = {
  1: { start: '07:00', end: '20:00', off: false },
  2: { start: '07:00', end: '21:00', off: false },
  3: { start: '08:00', end: '20:00', off: false },
  4: { start: '07:00', end: '21:00', off: false },
  5: { start: '07:00', end: '19:00', off: false },
  6: { start: '09:00', end: '15:00', off: false },
  // Sunday is a short weekend block rather than a day off, so the "Dziś" tab
  // is never empty whichever day the seeder is run on.
  7: { start: '10:00', end: '14:00', off: false },
};

function buildWorkingHours(
  em: EntityManager,
  user: UserMikroOrmEntity,
  existing: UserWorkingHoursMikroOrmEntity[],
): void {
  const byDay = new Map(existing.map((row) => [row.dayOfWeek, row]));

  for (const [day, spec] of Object.entries(WORKING_HOURS)) {
    const dayOfWeek = Number(day);
    const row = byDay.get(dayOfWeek);

    if (row) {
      row.startTime = spec.start;
      row.endTime = spec.end;
      row.isDayOff = spec.off;
      row.deletedAt = null;
      continue;
    }

    em.persist(
      new UserWorkingHoursMikroOrmEntity({
        user,
        dayOfWeek,
        startTime: spec.start,
        endTime: spec.end,
        isDayOff: spec.off,
      }),
    );
  }
}

function buildIntegrations(
  em: EntityManager,
  user: UserMikroOrmEntity,
  now: Date,
): void {
  const integrations: UserIntegrationMikroOrmEntity[] = [
    new UserIntegrationMikroOrmEntity({
      user,
      provider: IntegrationProviderEnum.GOOGLE_CALENDAR,
      status: IntegrationStatusEnum.CONNECTED,
      externalAccountId: 'kamil.wiernek@gmail.com',
      accessToken: 'seed-google-access-token',
      refreshToken: 'seed-google-refresh-token',
      expiresAt: addDays(now, 30),
      scopes: ['https://www.googleapis.com/auth/calendar'],
      settings: {
        defaultCalendarId: 'primary',
        timeZone: TIMEZONE,
      },
      lastSyncedAt: addMinutes(now, -18),
    }),
    new UserIntegrationMikroOrmEntity({
      user,
      provider: IntegrationProviderEnum.INSTAGRAM_DM,
      status: IntegrationStatusEnum.CONNECTED,
      externalAccountId: '17841400000000001',
      accessToken: 'seed-instagram-access-token',
      scopes: ['instagram_manage_messages', 'pages_messaging'],
      settings: {
        instagramBusinessAccountId: '17841400000000001',
        facebookPageId: '100000000000001',
        pageName: 'Kamil Wiernek Tenis',
      },
      lastSyncedAt: addMinutes(now, -5),
    }),
    new UserIntegrationMikroOrmEntity({
      user,
      provider: IntegrationProviderEnum.WHATSAPP_CLOUD,
      status: IntegrationStatusEnum.CONNECTED,
      externalAccountId: '15550001111',
      accessToken: 'seed-whatsapp-access-token',
      scopes: ['whatsapp_business_messaging'],
      settings: {
        phoneNumberId: '109876543210987',
        wabaId: '123456789012345',
        displayPhoneNumber: '+48 601 234 567',
      },
      lastSyncedAt: addMinutes(now, -42),
    }),
    new UserIntegrationMikroOrmEntity({
      user,
      provider: IntegrationProviderEnum.SMS_PROVIDER,
      status: IntegrationStatusEnum.ERROR,
      externalAccountId: 'smsapi-kamil',
      scopes: [],
      settings: {},
      errorMessage: 'Brak środków na koncie SMSAPI (HTTP 402).',
      lastSyncedAt: addDays(now, -3),
    }),
  ];

  integrations.forEach((integration) => em.persist(integration));
}

type SeededCustomer = {
  entity: CustomerMikroOrmEntity;
  /** Relative likelihood of getting a training slot. */
  weight: number;
  channel: MessageChannel | null;
  usesPackages: boolean;
};

function buildCustomers(
  em: EntityManager,
  user: UserMikroOrmEntity,
  random: Random,
  count: number,
  now: Date,
): SeededCustomer[] {
  const customers: SeededCustomer[] = [];
  const usedNames = new Set<string>();

  for (let index = 0; index < count; index += 1) {
    const female = random.bool(0.45);
    const firstName = random.pick(
      female ? FIRST_NAMES_FEMALE : FIRST_NAMES_MALE,
    );
    // Polish surnames in -ski/-cki decline for women.
    const feminize = (name: string): string =>
      female && /(ski|cki)$/.test(name) ? `${name.slice(0, -1)}a` : name;

    let lastName: string = feminize(random.pick(LAST_NAMES));

    let fullName = `${firstName} ${lastName}`;
    for (
      let retry = 0;
      usedNames.has(fullName) && retry < LAST_NAMES.length;
      retry += 1
    ) {
      lastName = feminize(random.pick(LAST_NAMES));
      fullName = `${firstName} ${lastName}`;
    }
    usedNames.add(fullName);

    const source = random.weighted<CustomerSource>([
      [CustomerSource.IG, 4],
      [CustomerSource.WHATSAPP, 3],
      [CustomerSource.MANUAL, 3],
      [CustomerSource.MOBILE, 2],
      [CustomerSource.WEB, 1],
    ]);

    const status = random.weighted<CustomerStatusEnum>([
      [CustomerStatusEnum.ACTIVE, 7],
      [CustomerStatusEnum.INACTIVE, 2],
      [CustomerStatusEnum.GUEST, 2],
      [CustomerStatusEnum.BLOCKED, 1],
    ]);

    const slug = `${firstName}.${lastName}`
      .toLowerCase()
      .normalize('NFD')
      .replace(/[łŁ]/g, 'l')
      .replace(/[^a-z.]/g, '');

    const channel =
      source === CustomerSource.IG
        ? MessageChannel.INSTAGRAM
        : source === CustomerSource.WHATSAPP
          ? MessageChannel.WHATSAPP
          : random.bool(0.35)
            ? MessageChannel.SMS
            : null;

    const entity = new CustomerMikroOrmEntity({
      user,
      source,
      firstName,
      lastName,
      nickname: random.bool(0.15) ? random.pick(NICKNAMES) : undefined,
      email: random.bool(0.8) ? `${slug}${index}@example.com` : undefined,
      phoneNumber: random.bool(0.85)
        ? `+4860${String(1000000 + index).slice(0, 7)}`
        : undefined,
      avatarUrl: `https://i.pravatar.cc/240?u=slotty-${index}`,
      instagramAccountId:
        source === CustomerSource.IG
          ? `ig_${1000 + index}`
          : random.bool(0.1)
            ? `ig_${9000 + index}`
            : undefined,
      whatsappAccountId:
        source === CustomerSource.WHATSAPP ? `wa_${2000 + index}` : undefined,
      equipmentToBring: random.bool(0.5)
        ? random.sample(EQUIPMENT, random.int(1, 3))
        : undefined,
      focusAreas: random.sample(FOCUS_AREAS, random.int(1, 4)),
      healthNotes: random.bool(0.3) ? random.pick(HEALTH_NOTES) : undefined,
      generalNotes: random.bool(0.7) ? random.pick(GENERAL_NOTES) : undefined,
      status,
      aiOptOut: random.bool(0.12),
      preferredLanguage: random.bool(0.9) ? 'pl' : 'en',
      totalSessionsCount: 0,
      noShowCount: 0,
      createdAt: addDays(now, -random.int(10, 420)),
    });

    em.persist(entity);

    // Blocked and guest clients barely train; a handful of regulars carry the calendar.
    const weight =
      status === CustomerStatusEnum.BLOCKED
        ? 0
        : status === CustomerStatusEnum.GUEST
          ? 1
          : status === CustomerStatusEnum.INACTIVE
            ? 1
            : random.weighted([
                [8, 1],
                [5, 2],
                [3, 4],
                [2, 4],
              ]);

    customers.push({
      entity,
      weight,
      channel,
      usesPackages: random.bool(0.4),
    });
  }

  return customers;
}

function buildPackageTemplates(
  em: EntityManager,
  user: UserMikroOrmEntity,
  now: Date,
): PackageTemplateMikroOrmEntity[] {
  const specs = [
    {
      name: 'Karnet 4 treningi indywidualne',
      description: 'Cztery treningi 1:1, kort w cenie. Ważny 45 dni.',
      sessionCount: 4,
      price: 56000,
      validityDays: 45,
      isActive: true,
    },
    {
      name: 'Karnet 8 treningów indywidualnych',
      description: 'Osiem treningów 1:1 z planem na cały cykl.',
      sessionCount: 8,
      price: 108000,
      validityDays: 90,
      isActive: true,
    },
    {
      name: 'Karnet 10 treningów + analiza wideo',
      description: 'Dziesięć treningów, dwie sesje analizy nagrań w cenie.',
      sessionCount: 10,
      price: 140000,
      validityDays: 120,
      isActive: true,
    },
    {
      name: 'Pakiet 5 treningów padla (2v2)',
      description: 'Pięć treningów w hali na Postępu, cena za osobę.',
      sessionCount: 5,
      price: 45000,
      validityDays: 60,
      isActive: true,
    },
    {
      name: 'Trening próbny + plan startowy',
      description: 'Jeden trening diagnostyczny i pisemny plan na 4 tygodnie.',
      sessionCount: 1,
      price: 12000,
      validityDays: 14,
      isActive: true,
    },
    {
      name: 'Obóz weekendowy (edycja wiosenna)',
      description: 'Trzy sesje w weekend, archiwalna oferta.',
      sessionCount: 3,
      price: 39000,
      validityDays: 30,
      isActive: false,
    },
  ];

  return specs.map((spec, index) => {
    const template = new PackageTemplateMikroOrmEntity({
      user,
      ...spec,
      currency: Currency.PLN,
      createdAt: addDays(now, -300 + index * 20),
    });
    em.persist(template);

    return template;
  });
}

type SlotPlan = {
  start: Date;
  end: Date;
  isPast: boolean;
};

function planSlots(
  random: Random,
  from: Date,
  to: Date,
  now: Date,
): SlotPlan[] {
  const slots: SlotPlan[] = [];

  for (const day of eachDay(from, to)) {
    const spec = WORKING_HOURS[isoDayOfWeek(day)];
    if (!spec || spec.off) continue;

    const [startHour, startMinute] = parseHourMinute(spec.start);
    const [endHour, endMinute] = parseHourMinute(spec.end);

    const dayStart = zonedToUtc(
      TIMEZONE,
      day.getUTCFullYear(),
      day.getUTCMonth() + 1,
      day.getUTCDate(),
      startHour,
      startMinute,
    );
    const dayEnd = zonedToUtc(
      TIMEZONE,
      day.getUTCFullYear(),
      day.getUTCMonth() + 1,
      day.getUTCDate(),
      endHour,
      endMinute,
    );

    // Days are never fully booked — leave gaps so the calendar reads naturally.
    const occupancy = random.weighted([
      [0.35, 2],
      [0.6, 4],
      [0.85, 3],
    ]);

    let cursor = dayStart;
    while (addMinutes(cursor, SESSION_MINUTES).getTime() <= dayEnd.getTime()) {
      if (random.next() < occupancy) {
        const end = addMinutes(cursor, SESSION_MINUTES);
        slots.push({
          start: cursor,
          end,
          isPast: end.getTime() < now.getTime(),
        });
        cursor = addMinutes(end, random.pick([0, 0, 30, 60]));
      } else {
        cursor = addMinutes(cursor, SESSION_MINUTES);
      }
    }
  }

  return slots;
}

type EventStats = {
  completed: number;
  noShow: number;
};

function buildEvents(
  em: EntityManager,
  user: UserMikroOrmEntity,
  customers: SeededCustomer[],
  random: Random,
  slots: SlotPlan[],
): { events: EventMikroOrmEntity[]; stats: Map<string, EventStats> } {
  const bookable = customers.filter((customer) => customer.weight > 0);
  const weighted = bookable.map(
    (customer) => [customer, customer.weight] as const,
  );
  const stats = new Map<string, EventStats>();
  const events: EventMikroOrmEntity[] = [];
  const placeNames = TRAINING_PLACES.map((place) => place.name ?? 'Kort');

  slots.forEach((slot, index) => {
    const type = random.weighted<EventType>([
      [EventType.INDIVIDUAL_SESSION, 12],
      [EventType.GROUP_SESSION, 3],
      [EventType.PERSONAL_BLOCK, 1],
    ]);

    if (type === EventType.PERSONAL_BLOCK) {
      events.push(
        new EventMikroOrmEntity({
          user,
          customer: null,
          status: slot.isPast
            ? EventStatusEnum.COMPLETED
            : EventStatusEnum.CONFIRMED,
          type,
          isPaymentApplicableYet: false,
          price: 0,
          currency: Currency.PLN,
          location: undefined,
          source: EventSource.TRAINER_MANUAL,
          isPaid: false,
          title: random.pick(PERSONAL_BLOCK_TITLES),
          startDate: slot.start,
          endDate: slot.end,
          createdAt: addDays(slot.start, -random.int(1, 10)),
        }),
      );
      return;
    }

    const customer = random.weighted(weighted);
    const stat = stats.get(customer.entity.id) ?? { completed: 0, noShow: 0 };

    const status = slot.isPast
      ? random.weighted<EventStatusEnum>([
          [EventStatusEnum.COMPLETED, 84],
          [EventStatusEnum.NO_SHOW, 4],
          [EventStatusEnum.CANCELLED_BY_CUSTOMER, 9],
          [EventStatusEnum.CANCELLED_BY_TRAINER, 3],
        ])
      : random.weighted<EventStatusEnum>([
          [EventStatusEnum.CONFIRMED, 6],
          [EventStatusEnum.SCHEDULED, 4],
        ]);

    if (status === EventStatusEnum.COMPLETED) stat.completed += 1;
    if (status === EventStatusEnum.NO_SHOW) stat.noShow += 1;
    stats.set(customer.entity.id, stat);

    const isGroup = type === EventType.GROUP_SESSION;
    // A package client's session is prepaid, so the event itself carries no price.
    const coveredByPackage = customer.usesPackages && !isGroup;
    const price = coveredByPackage ? 0 : isGroup ? 22000 : 15000;
    const isPaid =
      coveredByPackage ||
      (status === EventStatusEnum.COMPLETED && random.bool(0.88));

    const source = random.weighted<EventSource>([
      [EventSource.AI_BOT, 5],
      [EventSource.TRAINER_MANUAL, 4],
      [EventSource.GOOGLE_SYNC, 1],
    ]);

    const syncedToGoogle =
      source === EventSource.GOOGLE_SYNC || random.bool(0.4);

    events.push(
      new EventMikroOrmEntity({
        user,
        customer: customer.entity,
        status,
        type,
        isPaymentApplicableYet: !coveredByPackage,
        price,
        paymentMethod: isPaid
          ? random.weighted<PaymentMethod>([
              [PaymentMethod.BLIK, 6],
              [PaymentMethod.CASH, 2],
              [PaymentMethod.BANK_TRANSFER, 2],
            ])
          : undefined,
        currency: Currency.PLN,
        location: random.pick(placeNames),
        source,
        isPaid,
        title: isGroup
          ? `Padel 2v2 — ${customer.entity.firstName}`
          : `Trening — ${customer.entity.firstName} ${customer.entity.lastName ?? ''}`.trim(),
        description: random.bool(0.3)
          ? 'Klient prosił o więcej gry punktowej.'
          : undefined,
        startDate: slot.start,
        endDate: slot.end,
        googleCalendarId: syncedToGoogle ? 'primary' : undefined,
        googleEventId: syncedToGoogle ? `seed-gcal-${index}` : undefined,
        preSessionPlan: random.bool(0.55)
          ? random.pick(SESSION_PLANS)
          : undefined,
        postSessionNotes:
          status === EventStatusEnum.COMPLETED && random.bool(0.6)
            ? random.pick(POST_SESSION_NOTES)
            : undefined,
        createdAt: addDays(slot.start, -random.int(1, 21)),
      }),
    );
  });

  events.forEach((event) => em.persist(event));

  return { events, stats };
}

function buildCustomerPackages(
  em: EntityManager,
  user: UserMikroOrmEntity,
  customers: SeededCustomer[],
  templates: PackageTemplateMikroOrmEntity[],
  random: Random,
  now: Date,
): CustomerPackageMikroOrmEntity[] {
  const activeTemplates = templates.filter((template) => template.isActive);
  const packages: CustomerPackageMikroOrmEntity[] = [];

  for (const customer of customers) {
    if (!customer.usesPackages) continue;

    // Regulars have a purchase history, not just the current karnet.
    const historyCount = random.weighted([
      [1, 4],
      [2, 3],
      [3, 2],
      [4, 1],
    ]);

    for (let index = 0; index < historyCount; index += 1) {
      const isCurrent = index === historyCount - 1;
      const template = random.pick(activeTemplates);
      const purchasedAt = addDays(
        now,
        isCurrent ? -random.int(1, 40) : -random.int(60, 400),
      );
      const expiresAt = template.validityDays
        ? addDays(purchasedAt, template.validityDays)
        : null;

      // Past purchases mostly ran out; the rest died on the expiry date or a refund.
      const outcome = isCurrent
        ? 'current'
        : random.weighted<'depleted' | 'expired' | 'cancelled'>([
            ['depleted', 6],
            ['expired', 2],
            ['cancelled', 2],
          ]);

      const consumed =
        outcome === 'depleted'
          ? template.sessionCount
          : random.int(0, template.sessionCount - 1);
      const remaining = template.sessionCount - consumed;

      let status: CustomerPackageStatusEnum;
      if (remaining === 0) {
        status = CustomerPackageStatusEnum.DEPLETED;
      } else if (outcome === 'cancelled') {
        status = CustomerPackageStatusEnum.CANCELLED;
      } else if (
        outcome === 'expired' ||
        (expiresAt && expiresAt.getTime() < now.getTime())
      ) {
        status = CustomerPackageStatusEnum.EXPIRED;
      } else {
        status = CustomerPackageStatusEnum.ACTIVE;
      }

      const customerPackage = new CustomerPackageMikroOrmEntity({
        user,
        customer: customer.entity,
        packageTemplate: template,
        name: template.name,
        totalSessions: template.sessionCount,
        remainingSessions: remaining,
        pricePaid: template.price,
        currency: Currency.PLN,
        isPaid: !isCurrent || random.bool(0.85),
        status,
        expiresAt,
        createdAt: purchasedAt,
      });

      em.persist(customerPackage);
      packages.push(customerPackage);
    }
  }

  return packages;
}

function buildMessages(
  em: EntityManager,
  user: UserMikroOrmEntity,
  customers: SeededCustomer[],
  random: Random,
  now: Date,
): MessageMikroOrmEntity[] {
  const messages: MessageMikroOrmEntity[] = [];
  const threaded = customers.filter((customer) => customer.channel !== null);

  threaded.forEach((customer, threadIndex) => {
    const channel = customer.channel as MessageChannel;
    const messageCount = random.int(6, 42);
    // Threads run from an old first contact up to something recent.
    let cursor = addDays(now, -random.int(20, 240));

    for (let index = 0; index < messageCount; index += 1) {
      cursor = addMinutes(cursor, random.int(4, 60 * 26));
      if (cursor.getTime() > now.getTime()) break;

      const sender =
        index === 0
          ? MessageSender.CUSTOMER
          : random.weighted<MessageSender>([
              [MessageSender.CUSTOMER, 5],
              [MessageSender.AI_BOT, customer.entity.aiOptOut ? 0 : 4],
              [MessageSender.TRAINER, customer.entity.aiOptOut ? 4 : 2],
            ]);

      const content =
        sender === MessageSender.CUSTOMER
          ? index === 0
            ? random.pick(CUSTOMER_OPENERS)
            : random.pick(CUSTOMER_FOLLOWUPS)
          : sender === MessageSender.AI_BOT
            ? random.pick(BOT_REPLIES)
            : random.pick(TRAINER_REPLIES);

      const bookedByBot = sender === MessageSender.AI_BOT && random.bool(0.25);

      messages.push(
        new MessageMikroOrmEntity({
          user,
          customer: customer.entity,
          messageContent: content,
          sender,
          channel,
          externalMessageId: `seed-${channel.toLowerCase()}-${threadIndex}-${index}`,
          metadata: bookedByBot
            ? {
                executedTools: [
                  {
                    toolName: 'create_event',
                    args: {
                      customerId: customer.entity.id,
                      startDate: addDays(
                        cursor,
                        random.int(1, 7),
                      ).toISOString(),
                    },
                    result: 'SUCCESS',
                  },
                ],
              }
            : undefined,
          createdAt: cursor,
          updatedAt: cursor,
        }),
      );
    }
  });

  messages.forEach((message) => em.persist(message));

  return messages;
}

function buildBroadcasts(
  em: EntityManager,
  user: UserMikroOrmEntity,
  customers: SeededCustomer[],
  random: Random,
  now: Date,
): { broadcasts: BroadcastMikroOrmEntity[]; recipients: number } {
  const broadcasts: BroadcastMikroOrmEntity[] = [];
  let recipientCount = 0;

  BROADCAST_TEXTS.forEach((text, index) => {
    // Cycled rather than rolled, so every channel and every status is present
    // in the app no matter which --seed is used.
    const channels = [
      MessageChannel.INSTAGRAM,
      MessageChannel.WHATSAPP,
      MessageChannel.SMS,
    ];
    const statuses = [
      BroadcastStatusEnum.COMPLETED,
      BroadcastStatusEnum.COMPLETED,
      BroadcastStatusEnum.COMPLETED,
      BroadcastStatusEnum.DRAFT,
      BroadcastStatusEnum.COMPLETED,
      BroadcastStatusEnum.SENDING,
      BroadcastStatusEnum.FAILED,
      BroadcastStatusEnum.DRAFT,
    ];

    const channel = channels[index % channels.length];
    const status = statuses[index % statuses.length];

    const isDraft = status === BroadcastStatusEnum.DRAFT;
    const scheduledAt = isDraft
      ? addDays(now, random.int(1, 21))
      : addDays(now, -random.int(1, 180));

    // Reach is per-channel: a broadcast goes to everyone the trainer can
    // actually contact there, not only to whoever already writes on it.
    const reachable = (customer: SeededCustomer): boolean => {
      if (customer.entity.status === CustomerStatusEnum.BLOCKED) return false;

      switch (channel) {
        case MessageChannel.INSTAGRAM:
          return Boolean(customer.entity.instagramAccountId);
        case MessageChannel.WHATSAPP:
          return Boolean(customer.entity.whatsappAccountId);
        default:
          return Boolean(customer.entity.phoneNumber);
      }
    };

    const audience = customers.filter(reachable);
    const targeted = random.sample(
      audience,
      random.int(Math.ceil(audience.length / 2), audience.length),
    );

    const broadcast = new BroadcastMikroOrmEntity({
      user,
      messageText: text,
      targetChannel: channel,
      status,
      scheduledAt,
      sentCount: 0,
      createdAt: addDays(scheduledAt, -random.int(1, 5)),
    });
    em.persist(broadcast);
    broadcasts.push(broadcast);

    if (isDraft) return;

    let sent = 0;

    targeted.forEach((customer, recipientIndex) => {
      const recipientStatus =
        status === BroadcastStatusEnum.FAILED
          ? BroadcastRecipientStatusEnum.FAILED
          : status === BroadcastStatusEnum.SENDING
            ? random.weighted<BroadcastRecipientStatusEnum>([
                [BroadcastRecipientStatusEnum.SENT, 3],
                [BroadcastRecipientStatusEnum.PROCESSING, 2],
                [BroadcastRecipientStatusEnum.PENDING, 2],
              ])
            : random.weighted<BroadcastRecipientStatusEnum>([
                [BroadcastRecipientStatusEnum.DELIVERED, 7],
                [BroadcastRecipientStatusEnum.SENT, 2],
                [BroadcastRecipientStatusEnum.FAILED, 1],
              ]);

      const wasSent =
        recipientStatus === BroadcastRecipientStatusEnum.SENT ||
        recipientStatus === BroadcastRecipientStatusEnum.DELIVERED;

      let message: MessageMikroOrmEntity | null = null;

      if (wasSent) {
        sent += 1;
        message = new MessageMikroOrmEntity({
          user,
          customer: customer.entity,
          messageContent: text,
          sender: MessageSender.TRAINER,
          channel,
          externalMessageId: `seed-broadcast-${index}-${recipientIndex}`,
          createdAt: scheduledAt,
          updatedAt: scheduledAt,
        });
        em.persist(message);
      }

      em.persist(
        new BroadcastRecipientMikroOrmEntity({
          broadcast,
          customer: customer.entity,
          status: recipientStatus,
          message,
          sentAt: wasSent ? scheduledAt : null,
          errorMessage:
            recipientStatus === BroadcastRecipientStatusEnum.FAILED
              ? 'Nie udało się dostarczyć wiadomości (24h window closed).'
              : null,
          createdAt: scheduledAt,
        }),
      );

      recipientCount += 1;
    });

    broadcast.sentCount = sent;
  });

  return { broadcasts, recipients: recipientCount };
}

async function main(): Promise<void> {
  if (process.env.NODE_ENV === 'production') {
    throw new Error('dev-seed refuses to run with NODE_ENV=production');
  }

  const options = parseOptions(process.argv.slice(2));
  const orm = await MikroORM.init({ ...ormConfig, debug: false });

  try {
    const em = orm.em.fork();
    const user = await em.findOne(UserMikroOrmEntity, { id: options.userId });

    if (!user) {
      throw new Error(
        `User ${options.userId} not found — seed the account first or pass --user=<uuid>.`,
      );
    }

    console.log(`Seeding for ${user.displayName} <${user.email}>`);
    console.log(
      `  seed=${options.seed} customers=${options.customerCount} ` +
        `range=-${options.monthsBack}m..+${options.monthsForward}m wipe=${options.wipe}`,
    );

    if (options.wipe) {
      const deleted = await wipeUserData(orm, options.userId);
      const summary = Object.entries(deleted)
        .filter(([, count]) => count > 0)
        .map(([table, count]) => `${table}=${count}`)
        .join(' ');
      console.log(`  wiped: ${summary || 'nothing to delete'}`);
    }

    const random = new Random(options.seed);
    const now = new Date();

    user.timezone = TIMEZONE;
    user.subscriptionStatus = 'pro';
    user.emailVerified = true;
    user.lastLoginAt = addMinutes(now, -random.int(5, 240));

    // Soft-deleted rows still hold the unique (user) / (user, dayOfWeek) slots,
    // so they have to be found and revived rather than inserted alongside.
    const existingProfile = await em.findOne(
      UserProfileMikroOrmEntity,
      { user },
      { filters: false },
    );
    buildProfile(em, user, existingProfile);

    const existingHours = await em.find(
      UserWorkingHoursMikroOrmEntity,
      { user },
      { filters: false },
    );
    buildWorkingHours(em, user, existingHours);

    buildIntegrations(em, user, now);

    const customers = buildCustomers(
      em,
      user,
      random,
      options.customerCount,
      now,
    );
    const templates = buildPackageTemplates(em, user, now);

    const slots = planSlots(
      random,
      addDays(now, -Math.round(options.monthsBack * 30.4)),
      addDays(now, Math.round(options.monthsForward * 30.4)),
      now,
    );
    const { events, stats } = buildEvents(em, user, customers, random, slots);

    // Counters on the customer must agree with the events actually written.
    for (const customer of customers) {
      const stat = stats.get(customer.entity.id);
      customer.entity.totalSessionsCount = stat?.completed ?? 0;
      customer.entity.noShowCount = stat?.noShow ?? 0;
    }

    const packages = buildCustomerPackages(
      em,
      user,
      customers,
      templates,
      random,
      now,
    );
    const messages = buildMessages(em, user, customers, random, now);
    const { broadcasts, recipients } = buildBroadcasts(
      em,
      user,
      customers,
      random,
      now,
    );

    await em.flush();

    console.log('Done:');
    console.log(`  customers          ${customers.length}`);
    console.log(`  package templates  ${templates.length}`);
    console.log(`  customer packages  ${packages.length}`);
    console.log(`  events             ${events.length}`);
    console.log(`  messages           ${messages.length}`);
    console.log(`  broadcasts         ${broadcasts.length}`);
    console.log(`  broadcast targets  ${recipients}`);
  } finally {
    await orm.close(true);
  }
}

main().catch((error: unknown) => {
  console.error(error);
  process.exit(1);
});
