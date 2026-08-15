import { Module, forwardRef } from '@nestjs/common';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { AuthModule } from '@auth/auth.module';
import { CqrsModule } from '@common/application/cqrs';
import { CustomersModule } from '@customers/customers.module';
import { CreateMessageHandler } from './application/commands/create-message/create-message.handler';
import { RecordMessageToolExecutionHandler } from './application/commands/record-message-tool-execution/record-message-tool-execution.handler';
import { RestoreMessageHandler } from './application/commands/restore-message/restore-message.handler';
import { SoftDeleteMessageHandler } from './application/commands/soft-delete-message/soft-delete-message.handler';
import { MessageReadModelMapper } from './application/mappers';
import { GetMessageByIdHandler } from './application/queries/get-message-by-id/get-message-by-id.handler';
import { ListCustomerMessagesHandler } from './application/queries/list-customer-messages/list-customer-messages.handler';
import { ListMessagesHandler } from './application/queries/list-messages/list-messages.handler';
import { MESSAGE_REPOSITORY } from './domain/tokens';
import { MessageMikroOrmEntity } from './infrastructure/persistence/entities';
import { MessagePersistenceMapper } from './infrastructure/persistence/mappers';
import { MessageMikroOrmRepository } from './infrastructure/persistence/repositories/message-mikro-orm.repository';
import { MessagesController } from './presentation/messages.controller';

const CommandHandlers = [
  CreateMessageHandler,
  RecordMessageToolExecutionHandler,
  SoftDeleteMessageHandler,
  RestoreMessageHandler,
];

const QueryHandlers = [
  GetMessageByIdHandler,
  ListMessagesHandler,
  ListCustomerMessagesHandler,
];

@Module({
  imports: [
    CqrsModule,
    forwardRef(() => AuthModule),
    CustomersModule,
    MikroOrmModule.forFeature([MessageMikroOrmEntity]),
  ],
  controllers: [MessagesController],
  providers: [
    MessagePersistenceMapper,
    MessageReadModelMapper,
    {
      provide: MESSAGE_REPOSITORY,
      useClass: MessageMikroOrmRepository,
    },
    ...CommandHandlers,
    ...QueryHandlers,
  ],
  exports: [MESSAGE_REPOSITORY, MessageReadModelMapper, CqrsModule],
})
export class MessagesModule {}
