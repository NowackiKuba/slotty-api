import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';
import { paginationSchema } from '@common/pagination';
import { MessageChannel, MessageSender } from '@messages/domain/enums';

const executedToolSchema = z.object({
  toolName: z.string().min(1).max(120),
  args: z.record(z.string(), z.unknown()),
  result: z.enum(['SUCCESS', 'FAILED']),
});

export const createMessageSchema = z.object({
  customerId: z.string().uuid(),
  messageContent: z.string().min(1).max(4096),
  sender: z.nativeEnum(MessageSender),
  channel: z.nativeEnum(MessageChannel),
  externalMessageId: z.string().min(1).max(256).optional(),
  metadata: z
    .object({
      executedTools: z.array(executedToolSchema).optional(),
    })
    .optional(),
});

export class CreateMessageDto extends createZodDto(createMessageSchema) {}

export const recordMessageToolExecutionSchema = executedToolSchema;

export class RecordMessageToolExecutionDto extends createZodDto(
  recordMessageToolExecutionSchema,
) {}

export const listCustomerMessagesSchema = paginationSchema.extend({
  customerId: z.string().uuid(),
});

export class ListCustomerMessagesQueryDto extends createZodDto(
  listCustomerMessagesSchema,
) {}
