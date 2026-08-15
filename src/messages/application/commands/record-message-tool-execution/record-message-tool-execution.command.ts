import { Command } from '@common/application/cqrs';
import type { MetadataExecutedTool } from '@messages/domain/types';

export type RecordMessageToolExecutionCommandPayload = {
  userId: string;
  messageId: string;
  tool: MetadataExecutedTool;
};

export class RecordMessageToolExecutionCommand extends Command<RecordMessageToolExecutionCommandPayload> {
  constructor(payload: RecordMessageToolExecutionCommandPayload) {
    super(payload);
  }
}
