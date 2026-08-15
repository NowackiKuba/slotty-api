import { Injectable } from '@nestjs/common';
import { BroadcastRecipient } from '@broadcasts/domain/aggregates';
import { CustomerMikroOrmEntity } from '@customers/infrastructure/persistence/entities';
import { MessageMikroOrmEntity } from '@messages/infrastructure/persistence/entities';
import { BroadcastMikroOrmEntity } from '../entities';
import { BroadcastRecipientMikroOrmEntity } from '../entities';

@Injectable()
export class BroadcastRecipientPersistenceMapper {
  toDomain(entity: BroadcastRecipientMikroOrmEntity): BroadcastRecipient {
    return BroadcastRecipient.reconstitute({
      id: entity.id,
      broadcastId: entity.broadcast.id,
      customerId: entity.customer.id,
      status: entity.status,
      messageId: entity.message?.id ?? null,
      sentAt: entity.sentAt ?? null,
      errorMessage: entity.errorMessage ?? null,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
      deletedAt: entity.deletedAt ?? null,
    });
  }

  toPersistence(
    recipient: BroadcastRecipient,
    broadcast: BroadcastMikroOrmEntity,
    customer: CustomerMikroOrmEntity,
    message?: MessageMikroOrmEntity | null,
  ): BroadcastRecipientMikroOrmEntity {
    const snapshot = recipient.toSnapshot();

    return new BroadcastRecipientMikroOrmEntity({
      id: snapshot.id,
      broadcast,
      customer,
      status: snapshot.status,
      message: snapshot.messageId ? (message ?? null) : null,
      sentAt: snapshot.sentAt,
      errorMessage: snapshot.errorMessage,
      createdAt: snapshot.createdAt,
      updatedAt: snapshot.updatedAt,
      deletedAt: snapshot.deletedAt,
    });
  }
}
