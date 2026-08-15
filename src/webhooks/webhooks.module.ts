import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { AI_MESSAGE_QUEUE } from '@ai/application/dto/process-message-job.dto';
import { CustomersModule } from '@customers/customers.module';
import { MessagesModule } from '@messages/messages.module';
import { UsersModule } from '@users/users.module';
import { InboundWebhookService } from './application/services/inbound-webhook.service';
import { MessageContextResolver } from './infrastructure/services/message-context-resolver.service';
import { WebhooksController } from './presentation/http/webhooks.controller';

@Module({
  imports: [
    BullModule.registerQueue({ name: AI_MESSAGE_QUEUE }),
    UsersModule,
    CustomersModule,
    MessagesModule,
  ],
  controllers: [WebhooksController],
  providers: [MessageContextResolver, InboundWebhookService],
})
export class WebhooksModule {}
