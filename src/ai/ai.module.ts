import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { CqrsModule } from '@common/application/cqrs';
import { CustomersModule } from '@customers/customers.module';
import { EventsModule } from '@events/events.module';
import { MessagesModule } from '@messages/messages.module';
import { UsersModule } from '@users/users.module';
import { AI_MESSAGE_QUEUE } from './application/dto/process-message-job.dto';
import { AiAgentService } from './application/services/ai-agent.service';
import { ToolRegistryService } from './application/services/tool-registry.service';
import { CreateBookingTool } from './application/tools/create-booking.tool';
import { GetFreeSlotsTool } from './application/tools/get-free-slots.tool';
import { openAiAgentProvider } from './infrastructure/adapters/openai-agent.adapter';
import { metaOutboundSenderProvider } from './infrastructure/adapters/meta-outbound.adapter';
import { AiMessageProcessor } from './infrastructure/processors/ai-message.processor';

@Module({
  imports: [
    CqrsModule,
    BullModule.registerQueue({ name: AI_MESSAGE_QUEUE }),
    UsersModule,
    CustomersModule,
    EventsModule,
    MessagesModule,
  ],
  providers: [
    openAiAgentProvider,
    metaOutboundSenderProvider,
    CreateBookingTool,
    GetFreeSlotsTool,
    ToolRegistryService,
    AiAgentService,
    AiMessageProcessor,
  ],
})
export class AiModule {}
