import { Module, forwardRef } from '@nestjs/common';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { AuthModule } from '@auth/auth.module';
import { CqrsModule } from '@common/application/cqrs';
import { CustomersModule } from '@customers/customers.module';
import { UsersModule } from '@users/users.module';
import { CancelEventHandler } from './application/commands/cancel-event/cancel-event.handler';
import { CompleteEventHandler } from './application/commands/complete-event/complete-event.handler';
import { ConfirmEventHandler } from './application/commands/confirm-event/confirm-event.handler';
import { CreateEventHandler } from './application/commands/create-event/create-event.handler';
import { DeleteEventHandler } from './application/commands/delete-event/delete-event.handler';
import { RecordNoShowHandler } from './application/commands/record-no-show/record-no-show.handler';
import { UpdateEventHandler } from './application/commands/update-event/update-event.handler';
import { EventCompletedListener } from './application/events/event-completed/event-completed.listener';
import { EventMarkedAsNoShowListener } from './application/events/event-marked-as-no-show/event-marked-as-no-show.listener';
import { EventScheduledListener } from './application/events/event-scheduled/event-scheduled.listener';
import { EventReadModelMapper } from './application/mappers';
import { GetEventByIdHandler } from './application/queries/get-event-by-id/get-event-by-id.handler';
import { ListEventsInRangeHandler } from './application/queries/list-events-in-range/list-events-in-range.handler';
import { ListEventsHandler } from './application/queries/list-events/list-events.handler';
import { EVENT_REPOSITORY } from './domain/tokens';
import { EventMikroOrmEntity } from './infrastructure/persistence/entities';
import { EventPersistenceMapper } from './infrastructure/persistence/mappers/event.persistence-mapper';
import { EventMikroOrmRepository } from './infrastructure/persistence/repositories/event-mikro-orm.repository';
import { EventsController } from './presentation/events.controller';

const CommandHandlers = [
  CreateEventHandler,
  UpdateEventHandler,
  ConfirmEventHandler,
  CompleteEventHandler,
  CancelEventHandler,
  RecordNoShowHandler,
  DeleteEventHandler,
];

const QueryHandlers = [
  GetEventByIdHandler,
  ListEventsHandler,
  ListEventsInRangeHandler,
];

const EventListeners = [
  EventScheduledListener,
  EventCompletedListener,
  EventMarkedAsNoShowListener,
];

@Module({
  imports: [
    CqrsModule,
    forwardRef(() => AuthModule),
    CustomersModule,
    UsersModule,
    MikroOrmModule.forFeature([EventMikroOrmEntity]),
  ],
  controllers: [EventsController],
  providers: [
    EventPersistenceMapper,
    EventReadModelMapper,
    {
      provide: EVENT_REPOSITORY,
      useClass: EventMikroOrmRepository,
    },
    ...CommandHandlers,
    ...QueryHandlers,
    ...EventListeners,
  ],
  exports: [EVENT_REPOSITORY, EventReadModelMapper, CqrsModule],
})
export class EventsModule {}
