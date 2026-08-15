import { Logger } from '@nestjs/common';
import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { AiAgentService } from '@ai/application/services/ai-agent.service';
import {
  AI_MESSAGE_QUEUE,
  processMessageJobSchema,
  type ProcessMessageJobDto,
} from '@ai/application/dto/process-message-job.dto';

@Processor(AI_MESSAGE_QUEUE, { concurrency: 3 })
export class AiMessageProcessor extends WorkerHost {
  private readonly logger = new Logger(AiMessageProcessor.name);

  constructor(private readonly aiAgentService: AiAgentService) {
    super();
  }

  async process(job: Job<ProcessMessageJobDto>): Promise<void> {
    const payload = processMessageJobSchema.parse(job.data);
    this.logger.log(
      `Processing AI message ${payload.messageId} for customer ${payload.customerId}`,
    );
    await this.aiAgentService.processMessage(payload);
  }
}
