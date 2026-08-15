import { Inject, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { CommandBus, QueryBus } from '@common/application/cqrs';
import {
  AI_AGENT_PORT,
  type AiAgentPort,
  type AiMessage,
} from '@ai/domain/ports/ai-agent.port';
import {
  OUTBOUND_SENDER_PORT,
  type OutboundSenderPort,
} from '@ai/domain/ports/outbound-sender.port';
import type { ProcessMessageJobDto } from '../dto/process-message-job.dto';
import { ToolRegistryService } from './tool-registry.service';
import type { ToolExecutionContext } from '../tools/base.tool';
import { GetCustomerByIdQuery } from '@customers/application/queries/get-customer-by-id/get-customer-by-id.query';
import type { CustomerWithFullDetailsReadModel } from '@customers/application/read-models';
import { CustomerStatusEnum } from '@customers/domain/value-objects';
import { CreateMessageCommand } from '@messages/application/commands/create-message/create-message.command';
import { RecordMessageToolExecutionCommand } from '@messages/application/commands/record-message-tool-execution/record-message-tool-execution.command';
import { ListCustomerMessagesQuery } from '@messages/application/queries/list-customer-messages/list-customer-messages.query';
import type { MessageReadModel } from '@messages/application/read-models';
import { MessageAlreadyExistsException } from '@messages/domain/exceptions';
import { MessageSender } from '@messages/domain/enums';
import type { PaginatedResult } from '@common/pagination';
import { GetUserByIdQuery } from '@users/application/queries/get-user-by-id/get-user-by-id.query';
import { GetUserProfileByUserIdQuery } from '@users/application/queries/get-user-profile-by-user-id/get-user-profile-by-user-id.query';
import type {
  UserProfileReadModel,
  UserReadModel,
} from '@users/application/read-models';

const DEFAULT_MAX_TOOL_ITERATIONS = 8;
const HISTORY_PAGE_SIZE = 50;
const FALLBACK_REPLY =
  'Sorry, I could not complete that just now. Please try again in a moment.';

@Injectable()
export class AiAgentService {
  private readonly logger = new Logger(AiAgentService.name);
  private readonly maxToolIterations: number;

  constructor(
    @Inject(AI_AGENT_PORT)
    private readonly aiAgent: AiAgentPort,
    @Inject(OUTBOUND_SENDER_PORT)
    private readonly outboundSender: OutboundSenderPort,
    private readonly toolRegistry: ToolRegistryService,
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
    config: ConfigService,
  ) {
    this.maxToolIterations = Number(
      config.get<string>(
        'AI_MAX_TOOL_ITERATIONS',
        String(DEFAULT_MAX_TOOL_ITERATIONS),
      ),
    );
  }

  async processMessage(job: ProcessMessageJobDto): Promise<void> {
    const [customer, profile, trainer] = await Promise.all([
      this.queryBus.execute<
        GetCustomerByIdQuery,
        CustomerWithFullDetailsReadModel
      >(
        new GetCustomerByIdQuery({
          userId: job.trainerId,
          customerId: job.customerId,
        }),
      ),
      this.queryBus.execute<GetUserProfileByUserIdQuery, UserProfileReadModel>(
        new GetUserProfileByUserIdQuery({ userId: job.trainerId }),
      ),
      this.queryBus.execute<GetUserByIdQuery, UserReadModel>(
        new GetUserByIdQuery({ id: job.trainerId }),
      ),
    ]);

    if (!this.shouldProcess(customer, profile, job)) {
      return;
    }

    const context: ToolExecutionContext = {
      trainerId: job.trainerId,
      customerId: job.customerId,
      messageId: job.messageId,
      channel: job.channel,
    };
    const history = await this.loadRecentHistory(job);
    const messages: AiMessage[] = [
      {
        role: 'system',
        content: this.buildSystemPrompt(customer, profile, trainer),
      },
      ...history
        .filter((message) => message.id !== job.messageId)
        .map(toAiMessage),
      { role: 'user', content: job.messageContent },
    ];

    const reply = await this.runReActLoop(messages, context);
    const outbound = await this.outboundSender.send({
      trainerId: job.trainerId,
      customerId: job.customerId,
      channel: job.channel,
      text: reply,
    });

    await this.persistAssistantMessage(job, reply, outbound.externalMessageId);
  }

  private shouldProcess(
    customer: CustomerWithFullDetailsReadModel,
    profile: UserProfileReadModel,
    job: ProcessMessageJobDto,
  ): boolean {
    if (!profile.aiEnabled) {
      this.logger.log(
        `Skipping AI processing — trainer AI disabled (${job.trainerId})`,
      );
      return false;
    }

    if (customer.aiOptOut) {
      this.logger.log(
        `Skipping AI processing — customer opted out (${job.customerId})`,
      );
      return false;
    }

    if (customer.status === CustomerStatusEnum.BLOCKED) {
      this.logger.log(
        `Skipping AI processing — customer blocked (${job.customerId})`,
      );
      return false;
    }

    return true;
  }

  private async runReActLoop(
    messages: AiMessage[],
    context: ToolExecutionContext,
  ): Promise<string> {
    const tools = this.toolRegistry.getDefinitions();

    for (let iteration = 0; iteration < this.maxToolIterations; iteration++) {
      const completion = await this.aiAgent.complete({ messages, tools });

      if (completion.toolCalls.length === 0) {
        const content = completion.content?.trim();
        return content || FALLBACK_REPLY;
      }

      messages.push({
        role: 'assistant',
        content: completion.content,
        toolCalls: completion.toolCalls,
      });

      for (const call of completion.toolCalls) {
        let result: unknown;
        let success = true;

        try {
          result = await this.toolRegistry.execute(
            call.name,
            call.arguments,
            context,
          );
        } catch (error) {
          success = false;
          result = { error: errorMessage(error) };
          this.logger.warn(`Tool ${call.name} failed: ${errorMessage(error)}`);
        }

        messages.push({
          role: 'tool',
          toolCallId: call.id,
          content: JSON.stringify(result),
        });

        await this.recordToolExecution(
          context,
          call.name,
          sanitizeRecordedArgs(call.arguments),
          success,
        );
      }
    }

    this.logger.warn(
      `Reached max tool iterations (${this.maxToolIterations}) for message ${context.messageId}`,
    );

    return FALLBACK_REPLY;
  }

  private async loadRecentHistory(
    job: ProcessMessageJobDto,
  ): Promise<MessageReadModel[]> {
    const probe = await this.queryBus.execute<
      ListCustomerMessagesQuery,
      PaginatedResult<MessageReadModel>
    >(
      new ListCustomerMessagesQuery({
        userId: job.trainerId,
        customerId: job.customerId,
        page: 1,
        limit: 1,
      }),
    );
    const total = probe.meta.total;

    if (total === 0) {
      return [];
    }

    const lastPage = Math.max(1, Math.ceil(total / HISTORY_PAGE_SIZE));
    const pages = lastPage === 1 ? [1] : [Math.max(1, lastPage - 1), lastPage];
    const chunks: MessageReadModel[] = [];

    for (const page of pages) {
      const result = await this.queryBus.execute<
        ListCustomerMessagesQuery,
        PaginatedResult<MessageReadModel>
      >(
        new ListCustomerMessagesQuery({
          userId: job.trainerId,
          customerId: job.customerId,
          page,
          limit: HISTORY_PAGE_SIZE,
        }),
      );
      chunks.push(...result.data);
    }

    return chunks.slice(-HISTORY_PAGE_SIZE);
  }

  private buildSystemPrompt(
    customer: CustomerWithFullDetailsReadModel,
    profile: UserProfileReadModel,
    trainer: UserReadModel,
  ): string {
    const customerName = [customer.firstName, customer.lastName]
      .filter(Boolean)
      .join(' ');
    const instructions = profile.aiCustomInstructions
      .map((line) => `- ${line}`)
      .join('\n');

    return [
      'You are the booking assistant for a sports trainer on Slotty.',
      `Trainer: ${trainer.displayName}. Timezone: ${trainer.timezone}.`,
      `Session length: ${profile.sessionDurationMinutes} minutes. Price: ${profile.pricePerSession} ${profile.currency}.`,
      `Customer: ${customerName || customer.firstName}. Preferred language: ${customer.preferredLanguage}.`,
      'Reply in the customer preferred language.',
      'Use get_free_slots to check availability and create_booking only after the customer confirms a specific slot.',
      'Never invent availability. Never ask the customer for trainer or customer identifiers.',
      'If a tool returns an error, explain the problem briefly and offer another time.',
      instructions ? `Trainer instructions:\n${instructions}` : '',
    ]
      .filter(Boolean)
      .join('\n');
  }

  private async recordToolExecution(
    context: ToolExecutionContext,
    toolName: string,
    args: Record<string, unknown>,
    success: boolean,
  ): Promise<void> {
    try {
      await this.commandBus.execute(
        new RecordMessageToolExecutionCommand({
          userId: context.trainerId,
          messageId: context.messageId,
          tool: {
            toolName,
            args,
            result: success ? 'SUCCESS' : 'FAILED',
          },
        }),
      );
    } catch (error) {
      this.logger.warn(
        `Failed to record tool execution for ${toolName}: ${errorMessage(error)}`,
      );
    }
  }

  private async persistAssistantMessage(
    job: ProcessMessageJobDto,
    content: string,
    externalMessageId: string,
  ): Promise<void> {
    try {
      await this.commandBus.execute(
        new CreateMessageCommand({
          userId: job.trainerId,
          customerId: job.customerId,
          messageContent: content,
          sender: MessageSender.AI_BOT,
          channel: job.channel,
          externalMessageId,
        }),
      );
    } catch (error) {
      if (error instanceof MessageAlreadyExistsException) {
        return;
      }

      throw error;
    }
  }
}

function toAiMessage(message: MessageReadModel): AiMessage {
  if (message.sender === MessageSender.CUSTOMER) {
    return { role: 'user', content: message.messageContent };
  }

  const prefix = message.sender === MessageSender.TRAINER ? '[Trainer] ' : '';

  return {
    role: 'assistant',
    content: `${prefix}${message.messageContent}`,
  };
}

function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : 'Unknown error';
}

const PRIVILEGED_ARG_KEYS = new Set(['trainerId', 'userId', 'customerId']);

function sanitizeRecordedArgs(
  args: Record<string, unknown>,
): Record<string, unknown> {
  return Object.fromEntries(
    Object.entries(args).filter(([key]) => !PRIVILEGED_ARG_KEYS.has(key)),
  );
}
