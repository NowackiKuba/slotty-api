import { Injectable } from '@nestjs/common';
import { Broadcast } from '@broadcasts/domain/aggregates';
import { UserMikroOrmEntity } from '@users/infrastructure/persistence/entities';
import { BroadcastMikroOrmEntity } from '../entities';

@Injectable()
export class BroadcastPersistenceMapper {
  toDomain(entity: BroadcastMikroOrmEntity): Broadcast {
    return Broadcast.reconstitute({
      id: entity.id,
      userId: entity.user.id,
      messageText: entity.messageText,
      targetChannel: entity.targetChannel,
      status: entity.status,
      scheduledAt: entity.scheduledAt,
      sentCount: entity.sentCount,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
      deletedAt: entity.deletedAt ?? null,
    });
  }

  toPersistence(
    broadcast: Broadcast,
    user: UserMikroOrmEntity,
  ): BroadcastMikroOrmEntity {
    const snapshot = broadcast.toSnapshot();

    return new BroadcastMikroOrmEntity({
      id: snapshot.id,
      user,
      messageText: snapshot.messageText,
      targetChannel: snapshot.targetChannel,
      status: snapshot.status,
      scheduledAt: snapshot.scheduledAt,
      sentCount: snapshot.sentCount,
      createdAt: snapshot.createdAt,
      updatedAt: snapshot.updatedAt,
      deletedAt: snapshot.deletedAt,
    });
  }
}
