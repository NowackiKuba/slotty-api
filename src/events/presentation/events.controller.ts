import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { CommandBus, QueryBus } from '@common/application/cqrs';
import { PaginationQuery } from '@common/pagination';
import {
  CurrentUser,
  type CurrentUserPayload,
} from '@auth/presentation/decorators/current-user.decorator';
import { JwtAuthGuard } from '@auth/presentation/guards/jwt-auth.guard';
import { CancelEventCommand } from '@events/application/commands/cancel-event/cancel-event.command';
import { CompleteEventCommand } from '@events/application/commands/complete-event/complete-event.command';
import { ConfirmEventCommand } from '@events/application/commands/confirm-event/confirm-event.command';
import { CreateEventCommand } from '@events/application/commands/create-event/create-event.command';
import { DeleteEventCommand } from '@events/application/commands/delete-event/delete-event.command';
import { RecordNoShowCommand } from '@events/application/commands/record-no-show/record-no-show.command';
import { UpdateEventCommand } from '@events/application/commands/update-event/update-event.command';
import { GetEventByIdQuery } from '@events/application/queries/get-event-by-id/get-event-by-id.query';
import { ListEventsInRangeQuery } from '@events/application/queries/list-events-in-range/list-events-in-range.query';
import { ListEventsQuery } from '@events/application/queries/list-events/list-events.query';
import { EventSource } from '@events/domain/enums';
import {
  CancelEventDto,
  CreateEventDto,
  ListEventsInRangeQueryDto,
  UpdateEventDto,
} from './dto/events.dto';

const emptyToNull = (value?: string | null): string | null => {
  if (value === undefined || value === '') {
    return null;
  }

  return value;
};

const emptyToUndefined = (value?: string | null): string | undefined => {
  const normalized = emptyToNull(value);

  return normalized === null ? undefined : normalized;
};

@Controller('events')
@UseGuards(JwtAuthGuard)
export class EventsController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @Get()
  list(
    @CurrentUser() user: CurrentUserPayload,
    @Query() query: PaginationQuery,
  ) {
    return this.queryBus.execute(
      new ListEventsQuery({
        userId: user.userId,
        page: query.page,
        limit: query.limit,
      }),
    );
  }

  @Get('range')
  listInRange(
    @CurrentUser() user: CurrentUserPayload,
    @Query() query: ListEventsInRangeQueryDto,
  ) {
    return this.queryBus.execute(
      new ListEventsInRangeQuery({
        userId: user.userId,
        from: query.from,
        to: query.to,
        customerId: emptyToUndefined(query.customerId),
      }),
    );
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(
    @CurrentUser() user: CurrentUserPayload,
    @Body() body: CreateEventDto,
  ) {
    return this.commandBus.execute(
      new CreateEventCommand({
        userId: user.userId,
        customerId: emptyToUndefined(body.customerId),
        type: body.type,
        price: body.price,
        paymentMethod: body.paymentMethod,
        currency: body.currency,
        location: emptyToUndefined(body.location),
        source: body.source ?? EventSource.TRAINER_MANUAL,
        title: body.title,
        description: emptyToUndefined(body.description),
        startDate: body.startDate,
        endDate: body.endDate,
        preSessionPlan: emptyToUndefined(body.preSessionPlan),
        postSessionNotes: emptyToUndefined(body.postSessionNotes),
      }),
    );
  }

  @Get(':eventId')
  getById(
    @CurrentUser() user: CurrentUserPayload,
    @Param('eventId') eventId: string,
  ) {
    return this.queryBus.execute(
      new GetEventByIdQuery({
        userId: user.userId,
        eventId,
      }),
    );
  }

  @Patch(':eventId')
  update(
    @CurrentUser() user: CurrentUserPayload,
    @Param('eventId') eventId: string,
    @Body() body: UpdateEventDto,
  ) {
    return this.commandBus.execute(
      new UpdateEventCommand({
        userId: user.userId,
        eventId,
        customerId: body.customerId,
        type: body.type,
        price: body.price,
        paymentMethod: body.paymentMethod,
        currency: body.currency,
        location:
          body.location === undefined ? undefined : emptyToNull(body.location),
        title: body.title,
        description:
          body.description === undefined
            ? undefined
            : emptyToNull(body.description),
        startDate: body.startDate,
        endDate: body.endDate,
        googleCalendarId:
          body.googleCalendarId === undefined
            ? undefined
            : emptyToNull(body.googleCalendarId),
        googleEventId:
          body.googleEventId === undefined
            ? undefined
            : emptyToNull(body.googleEventId),
        preSessionPlan:
          body.preSessionPlan === undefined
            ? undefined
            : emptyToNull(body.preSessionPlan),
        postSessionNotes:
          body.postSessionNotes === undefined
            ? undefined
            : emptyToNull(body.postSessionNotes),
        isPaymentApplicableYet: body.isPaymentApplicableYet,
        isPaid: body.isPaid,
      }),
    );
  }

  @Post(':eventId/confirm')
  confirm(
    @CurrentUser() user: CurrentUserPayload,
    @Param('eventId') eventId: string,
  ) {
    return this.commandBus.execute(
      new ConfirmEventCommand({
        userId: user.userId,
        eventId,
        mode: 'MANUAL',
      }),
    );
  }

  @Post(':eventId/complete')
  complete(
    @CurrentUser() user: CurrentUserPayload,
    @Param('eventId') eventId: string,
  ) {
    return this.commandBus.execute(
      new CompleteEventCommand({
        userId: user.userId,
        eventId,
      }),
    );
  }

  @Post(':eventId/cancel')
  cancel(
    @CurrentUser() user: CurrentUserPayload,
    @Param('eventId') eventId: string,
    @Body() body: CancelEventDto,
  ) {
    return this.commandBus.execute(
      new CancelEventCommand({
        userId: user.userId,
        eventId,
        byWho: body.byWho,
      }),
    );
  }

  @Post(':eventId/no-show')
  recordNoShow(
    @CurrentUser() user: CurrentUserPayload,
    @Param('eventId') eventId: string,
  ) {
    return this.commandBus.execute(
      new RecordNoShowCommand({
        userId: user.userId,
        eventId,
      }),
    );
  }

  @Delete(':eventId')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(
    @CurrentUser() user: CurrentUserPayload,
    @Param('eventId') eventId: string,
  ) {
    return this.commandBus.execute(
      new DeleteEventCommand({
        userId: user.userId,
        eventId,
      }),
    );
  }
}
