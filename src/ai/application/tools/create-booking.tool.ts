import { Injectable } from '@nestjs/common';
import { CommandBus, QueryBus } from '@common/application/cqrs';
import { Currency } from '@common/domain/enums';
import { CreateEventCommand } from '@events/application/commands/create-event/create-event.command';
import type { EventReadModel } from '@events/application/read-models';
import {
  EventSource,
  EventType,
  isEventType,
  isSessionEventType,
} from '@events/domain/enums';
import { GetCustomerByIdQuery } from '@customers/application/queries/get-customer-by-id/get-customer-by-id.query';
import type { CustomerWithFullDetailsReadModel } from '@customers/application/read-models';
import { GetUserByIdQuery } from '@users/application/queries/get-user-by-id/get-user-by-id.query';
import { GetUserProfileByUserIdQuery } from '@users/application/queries/get-user-profile-by-user-id/get-user-profile-by-user-id.query';
import type {
  UserProfileReadModel,
  UserReadModel,
} from '@users/application/read-models';
import { isPaymentMethod, type PaymentMethod } from '@users/domain/enums';
import { BaseTool, type ToolExecutionContext } from './base.tool';
import { parseDateTimeInTimeZone } from '../utils/zoned-datetime.util';

const MIN_DURATION_MINUTES = 15;
const MAX_DURATION_MINUTES = 240;

@Injectable()
export class CreateBookingTool extends BaseTool {
  readonly name = 'create_booking';
  readonly description =
    'Book a training session for the current customer on the trainer calendar. Use get_free_slots first and only book a slot the customer confirmed.';
  readonly parameters = {
    type: 'object',
    additionalProperties: false,
    properties: {
      startDate: {
        type: 'string',
        description:
          'Session start as ISO-8601 datetime. Naive datetimes are interpreted in the trainer timezone.',
      },
      title: {
        type: 'string',
        description: 'Optional session title.',
      },
      type: {
        type: 'string',
        enum: [EventType.INDIVIDUAL_SESSION, EventType.GROUP_SESSION],
        description: 'Session type. Defaults to INDIVIDUAL_SESSION.',
      },
      location: {
        type: 'string',
        description: 'Optional location name or address.',
      },
      description: {
        type: 'string',
        description: 'Optional notes visible on the booking.',
      },
      durationMinutes: {
        type: 'integer',
        description:
          'Optional duration in minutes. Defaults to the trainer session length.',
      },
    },
    required: ['startDate'],
  };

  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {
    super();
  }

  async execute(
    args: Record<string, unknown>,
    context: ToolExecutionContext,
  ): Promise<unknown> {
    const startDateRaw = requiredString(args.startDate, 'startDate');
    const [profile, user, customer] = await Promise.all([
      this.queryBus.execute<GetUserProfileByUserIdQuery, UserProfileReadModel>(
        new GetUserProfileByUserIdQuery({ userId: context.trainerId }),
      ),
      this.queryBus.execute<GetUserByIdQuery, UserReadModel>(
        new GetUserByIdQuery({ id: context.trainerId }),
      ),
      this.queryBus.execute<
        GetCustomerByIdQuery,
        CustomerWithFullDetailsReadModel
      >(
        new GetCustomerByIdQuery({
          userId: context.trainerId,
          customerId: context.customerId,
        }),
      ),
    ]);

    const durationMinutes = resolveDurationMinutes(
      args.durationMinutes,
      profile.sessionDurationMinutes,
    );
    const startDate = parseDateTimeInTimeZone(startDateRaw, user.timezone);
    const endDate = new Date(startDate.getTime() + durationMinutes * 60 * 1000);
    const type = resolveEventType(args.type);
    const title =
      optionalString(args.title) ?? `Session with ${customer.firstName}`;
    const location = optionalString(args.location) ?? defaultLocation(profile);
    const paymentMethod = defaultPaymentMethod(profile.paymentMethods);

    const event = await this.commandBus.execute<
      CreateEventCommand,
      EventReadModel
    >(
      new CreateEventCommand({
        userId: context.trainerId,
        customerId: context.customerId,
        type,
        price: profile.pricePerSession,
        paymentMethod,
        currency: profile.currency ?? Currency.PLN,
        location,
        source: EventSource.AI_BOT,
        title,
        description: optionalString(args.description),
        startDate,
        endDate,
        googleCalendarId: profile.googleCalendarId ?? undefined,
      }),
    );

    return {
      eventId: event.id,
      title: event.title,
      type: event.type,
      status: event.status,
      startDate: event.startDate.toISOString(),
      endDate: event.endDate.toISOString(),
      location: event.location,
    };
  }
}

function requiredString(value: unknown, field: string): string {
  if (typeof value !== 'string' || !value.trim()) {
    throw new Error(`${field} is required`);
  }

  return value.trim();
}

function optionalString(value: unknown): string | undefined {
  if (typeof value !== 'string') {
    return undefined;
  }

  const trimmed = value.trim();
  return trimmed || undefined;
}

function resolveEventType(value: unknown): EventType {
  if (value === undefined || value === null || value === '') {
    return EventType.INDIVIDUAL_SESSION;
  }

  if (
    typeof value === 'string' &&
    isEventType(value) &&
    isSessionEventType(value)
  ) {
    return value;
  }

  throw new Error('type must be INDIVIDUAL_SESSION or GROUP_SESSION');
}

function resolveDurationMinutes(value: unknown, fallback: number): number {
  if (value === undefined || value === null || value === '') {
    return fallback;
  }

  const parsed = Number(value);

  if (!Number.isInteger(parsed)) {
    throw new Error('durationMinutes must be an integer');
  }

  if (parsed < MIN_DURATION_MINUTES || parsed > MAX_DURATION_MINUTES) {
    throw new Error(
      `durationMinutes must be between ${MIN_DURATION_MINUTES} and ${MAX_DURATION_MINUTES}`,
    );
  }

  return parsed;
}

function defaultLocation(profile: UserProfileReadModel): string | undefined {
  const place = profile.places[0];

  if (!place) {
    return undefined;
  }

  return place.name ?? place.address;
}

function defaultPaymentMethod(
  methods: PaymentMethod[],
): PaymentMethod | undefined {
  const first = methods[0];
  return first && isPaymentMethod(first) ? first : undefined;
}
