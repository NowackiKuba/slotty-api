import { z } from 'zod';
import { MessageChannel } from '@messages/domain/enums';

export const AI_MESSAGE_QUEUE = 'ai-message-processing';
export const PROCESS_INBOUND_MESSAGE_JOB = 'process-inbound-message';

export const processMessageJobSchema = z.object({
  trainerId: z.string().uuid(),
  customerId: z.string().uuid(),
  messageId: z.string().uuid(),
  channel: z.nativeEnum(MessageChannel),
  messageContent: z.string().min(1).max(4096),
  externalMessageId: z.string().min(1).max(256),
});

export type ProcessMessageJobDto = z.infer<typeof processMessageJobSchema>;
