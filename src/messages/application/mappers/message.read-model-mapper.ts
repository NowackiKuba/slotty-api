import { Injectable } from '@nestjs/common';
import { Message } from '@messages/domain/aggregates';
import { MessageReadModel } from '../read-models';

@Injectable()
export class MessageReadModelMapper {
  toReadModel(domain: Message): MessageReadModel {
    const snapshot = domain.toSnapshot();

    return {
      id: snapshot.id,
      userId: snapshot.userId,
      customerId: snapshot.customerId,
      messageContent: snapshot.messageContent,
      sender: snapshot.sender,
      channel: snapshot.channel,
      externalMessageId: snapshot.externalMessageId,
      metadata: snapshot.metadata,
      createdAt: snapshot.createdAt,
      updatedAt: snapshot.updatedAt,
    };
  }
}
