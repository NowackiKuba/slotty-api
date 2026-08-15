import { Module, forwardRef } from '@nestjs/common';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { AuthModule } from '@auth/auth.module';
import { CqrsModule } from '@common/application/cqrs';
import { CustomersModule } from '@customers/customers.module';
import { CompleteBroadcastHandler } from './application/commands/complete-broadcast/complete-broadcast.handler';
import { CreateBroadcastHandler } from './application/commands/create-broadcast/create-broadcast.handler';
import { FailBroadcastHandler } from './application/commands/fail-broadcast/fail-broadcast.handler';
import { RestoreBroadcastHandler } from './application/commands/restore-broadcast/restore-broadcast.handler';
import { SoftDeleteBroadcastHandler } from './application/commands/soft-delete-broadcast/soft-delete-broadcast.handler';
import { StartBroadcastHandler } from './application/commands/start-broadcast/start-broadcast.handler';
import { UpdateBroadcastRecipientHandler } from './application/commands/update-broadcast-recipient/update-broadcast-recipient.handler';
import { UpdateBroadcastHandler } from './application/commands/update-broadcast/update-broadcast.handler';
import { BroadcastReadModelMapper } from './application/mappers';
import { GetBroadcastByIdHandler } from './application/queries/get-broadcast-by-id/get-broadcast-by-id.handler';
import { ListBroadcastsHandler } from './application/queries/list-broadcasts/list-broadcasts.handler';
import {
  BROADCAST_RECIPIENT_REPOSITORY,
  BROADCAST_REPOSITORY,
} from './domain/tokens';
import {
  BroadcastMikroOrmEntity,
  BroadcastRecipientMikroOrmEntity,
} from './infrastructure/persistence/entities';
import {
  BroadcastPersistenceMapper,
  BroadcastRecipientPersistenceMapper,
} from './infrastructure/persistence/mappers';
import { BroadcastMikroOrmRepository } from './infrastructure/persistence/repositories/broadcast-mikro-orm.repository';
import { BroadcastRecipientMikroOrmRepository } from './infrastructure/persistence/repositories/broadcast-recipient-mikro-orm.repository';
import { BroadcastsController } from './presentation/broadcasts.controller';

const CommandHandlers = [
  CreateBroadcastHandler,
  UpdateBroadcastHandler,
  StartBroadcastHandler,
  CompleteBroadcastHandler,
  FailBroadcastHandler,
  UpdateBroadcastRecipientHandler,
  SoftDeleteBroadcastHandler,
  RestoreBroadcastHandler,
];

const QueryHandlers = [GetBroadcastByIdHandler, ListBroadcastsHandler];

@Module({
  imports: [
    CqrsModule,
    forwardRef(() => AuthModule),
    CustomersModule,
    MikroOrmModule.forFeature([
      BroadcastMikroOrmEntity,
      BroadcastRecipientMikroOrmEntity,
    ]),
  ],
  controllers: [BroadcastsController],
  providers: [
    BroadcastPersistenceMapper,
    BroadcastRecipientPersistenceMapper,
    BroadcastReadModelMapper,
    {
      provide: BROADCAST_REPOSITORY,
      useClass: BroadcastMikroOrmRepository,
    },
    {
      provide: BROADCAST_RECIPIENT_REPOSITORY,
      useClass: BroadcastRecipientMikroOrmRepository,
    },
    ...CommandHandlers,
    ...QueryHandlers,
  ],
  exports: [
    BROADCAST_REPOSITORY,
    BROADCAST_RECIPIENT_REPOSITORY,
    BroadcastReadModelMapper,
    CqrsModule,
  ],
})
export class BroadcastsModule {}
