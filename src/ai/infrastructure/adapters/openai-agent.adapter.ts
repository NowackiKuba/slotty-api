import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import OpenAI from 'openai';
import type {
  ChatCompletionMessageParam,
  ChatCompletionTool,
} from 'openai/resources/chat/completions';
import {
  AI_AGENT_PORT,
  type AiAgentPort,
  type AiCompleteInput,
  type AiCompletion,
  type AiMessage,
  type AiToolCall,
} from '@ai/domain/ports/ai-agent.port';

const DEFAULT_MODEL = 'gpt-4o';
const DEFAULT_MAX_TOKENS = 1024;

@Injectable()
export class OpenAiAgentAdapter implements AiAgentPort {
  private client: OpenAI | null = null;
  private readonly apiKey: string;
  private readonly model: string;
  private readonly maxTokens: number;

  constructor(config: ConfigService) {
    this.apiKey = config.get<string>('OPENAI_API_KEY')?.trim() ?? '';
    this.model = config.get<string>('OPENAI_MODEL', DEFAULT_MODEL);
    this.maxTokens = Number(
      config.get<string>('OPENAI_MAX_TOKENS', String(DEFAULT_MAX_TOKENS)),
    );
  }

  async complete(input: AiCompleteInput): Promise<AiCompletion> {
    const response = await this.getClient().chat.completions.create({
      model: this.model,
      messages: input.messages.map(toOpenAiMessage),
      tools: input.tools.map(toOpenAiTool),
      tool_choice: input.tools.length > 0 ? 'auto' : undefined,
      max_tokens: this.maxTokens,
    });
    const choice = response.choices[0]?.message;

    if (!choice) {
      return { content: null, toolCalls: [] };
    }

    return {
      content: choice.content,
      toolCalls: (choice.tool_calls ?? []).flatMap(parseToolCall),
    };
  }

  private getClient(): OpenAI {
    if (!this.apiKey) {
      throw new Error('OPENAI_API_KEY is not configured');
    }

    this.client ??= new OpenAI({ apiKey: this.apiKey });
    return this.client;
  }
}

function toOpenAiMessage(message: AiMessage): ChatCompletionMessageParam {
  switch (message.role) {
    case 'system':
      return { role: 'system', content: message.content };
    case 'user':
      return { role: 'user', content: message.content };
    case 'tool':
      return {
        role: 'tool',
        tool_call_id: message.toolCallId,
        content: message.content,
      };
    case 'assistant':
      return {
        role: 'assistant',
        content: message.content,
        tool_calls: message.toolCalls?.map((call) => ({
          id: call.id,
          type: 'function' as const,
          function: {
            name: call.name,
            arguments: JSON.stringify(call.arguments),
          },
        })),
      };
  }
}

function toOpenAiTool(
  tool: AiCompleteInput['tools'][number],
): ChatCompletionTool {
  return {
    type: 'function',
    function: {
      name: tool.name,
      description: tool.description,
      parameters: tool.parameters,
    },
  };
}

function parseToolCall(call: {
  id: string;
  type: string;
  function?: { name: string; arguments: string };
}): AiToolCall[] {
  if (call.type !== 'function' || !call.function) {
    return [];
  }

  return [
    {
      id: call.id,
      name: call.function.name,
      arguments: parseArguments(call.function.arguments),
    },
  ];
}

function parseArguments(raw: string): Record<string, unknown> {
  if (!raw.trim()) {
    return {};
  }

  try {
    const parsed: unknown = JSON.parse(raw);

    if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
      return parsed as Record<string, unknown>;
    }

    return {};
  } catch {
    return {};
  }
}

export const openAiAgentProvider = {
  provide: AI_AGENT_PORT,
  useClass: OpenAiAgentAdapter,
};
