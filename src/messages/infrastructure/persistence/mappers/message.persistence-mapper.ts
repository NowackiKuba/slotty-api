import { Injectable } from '@nestjs/common';
import { CustomerMikroOrmEntity } from '@customers/infrastructure/persistence/entities';
import { Message } from '@messages/domain/aggregates';
import { UserMikroOrmEntity } from '@users/infrastructure/persistence/entities';
import { MessageMikroOrmEntity } from '../entities';

@Injectable()
export class MessagePersistenceMapper {
  toDomain(entity: MessageMikroOrmEntity): Message {
    return Message.reconstitute({
      id: entity.id,
      userId: entity.user.id,
      customerId: entity.customer.id,
      messageContent: entity.messageContent,
      sender: entity.sender,
      channel: entity.channel,
      externalMessageId: entity.externalMessageId,
      metadata: entity.metadata,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
      deletedAt: entity.deletedAt ?? null,
    });
  }

  toPersistence(
    message: Message,
    user: UserMikroOrmEntity,
    customer: CustomerMikroOrmEntity,
  ): MessageMikroOrmEntity {
    const snapshot = message.toSnapshot();

    return new MessageMikroOrmEntity({
      id: snapshot.id,
      user,
      customer,
      messageContent: snapshot.messageContent,
      sender: snapshot.sender,
      channel: snapshot.channel,
      externalMessageId: snapshot.externalMessageId,
      metadata: snapshot.metadata ?? undefined,
      createdAt: snapshot.createdAt,
      updatedAt: snapshot.updatedAt,
      deletedAt: snapshot.deletedAt,
    });
  }
}
