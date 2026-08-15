import { Message } from '@messages/domain/aggregates';
import {
  MessageAccessDeniedException,
  MessageNotFoundException,
} from '@messages/domain/exceptions';
import type { IMessageRepository } from '@messages/domain/repositories';
import { MessageId } from '@messages/domain/value-objects';

export async function getOwnedMessage(
  messageRepository: IMessageRepository,
  messageId: string,
  userId: string,
  options?: { includeDeleted?: boolean },
): Promise<Message> {
  MessageId.create(messageId);

  const message = options?.includeDeleted
    ? await messageRepository.findByIdIncludingDeleted(messageId)
    : await messageRepository.findById(messageId);

  if (!message) {
    throw new MessageNotFoundException({ messageId, userId });
  }

  if (message.userId.value !== userId) {
    throw new MessageAccessDeniedException({ messageId, userId });
  }

  return message;
}
