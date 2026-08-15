import { Injectable } from '@nestjs/common';
import type { AiToolDefinition } from '@ai/domain/ports/ai-agent.port';
import { BaseTool, type ToolExecutionContext } from '../tools/base.tool';
import { CreateBookingTool } from '../tools/create-booking.tool';
import { GetFreeSlotsTool } from '../tools/get-free-slots.tool';

const PRIVILEGED_ARG_KEYS = new Set(['trainerId', 'userId', 'customerId']);

@Injectable()
export class ToolRegistryService {
  private readonly tools = new Map<string, BaseTool>();

  constructor(
    createBooking: CreateBookingTool,
    getFreeSlots: GetFreeSlotsTool,
  ) {
    this.register(createBooking);
    this.register(getFreeSlots);
  }

  private register(tool: BaseTool): void {
    this.tools.set(tool.name, tool);
  }

  getDefinitions(): AiToolDefinition[] {
    return [...this.tools.values()].map((tool) => tool.toDefinition());
  }

  async execute(
    name: string,
    args: Record<string, unknown>,
    context: ToolExecutionContext,
  ): Promise<unknown> {
    const tool = this.tools.get(name);

    if (!tool) {
      throw new Error(`Unknown tool: ${name}`);
    }

    return tool.execute(sanitizeToolArgs(args), context);
  }
}

function sanitizeToolArgs(
  args: Record<string, unknown>,
): Record<string, unknown> {
  return Object.fromEntries(
    Object.entries(args).filter(([key]) => !PRIVILEGED_ARG_KEYS.has(key)),
  );
}
