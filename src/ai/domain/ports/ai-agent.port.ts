export const AI_AGENT_PORT = Symbol('AI_AGENT_PORT');

export type AiToolDefinition = {
  name: string;
  description: string;
  parameters: Record<string, unknown>;
};

export type AiToolCall = {
  id: string;
  name: string;
  arguments: Record<string, unknown>;
};

export type AiMessage =
  | { role: 'system'; content: string }
  | { role: 'user'; content: string }
  | {
      role: 'assistant';
      content: string | null;
      toolCalls?: AiToolCall[];
    }
  | { role: 'tool'; toolCallId: string; content: string };

export type AiCompletion = {
  content: string | null;
  toolCalls: AiToolCall[];
};

export type AiCompleteInput = {
  messages: AiMessage[];
  tools: AiToolDefinition[];
};

export interface AiAgentPort {
  complete(input: AiCompleteInput): Promise<AiCompletion>;
}
