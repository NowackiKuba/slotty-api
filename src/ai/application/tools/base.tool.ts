import type { MessageChannel } from '@messages/domain/enums';
import type { AiToolDefinition } from '@ai/domain/ports/ai-agent.port';

export type ToolExecutionContext = {
  trainerId: string;
  customerId: string;
  messageId: string;
  channel: MessageChannel;
};

export abstract class BaseTool {
  abstract readonly name: string;
  abstract readonly description: string;
  abstract readonly parameters: Record<string, unknown>;

  abstract execute(
    args: Record<string, unknown>,
    context: ToolExecutionContext,
  ): Promise<unknown>;

  toDefinition(): AiToolDefinition {
    return {
      name: this.name,
      description: this.description,
      parameters: this.parameters,
    };
  }
}
