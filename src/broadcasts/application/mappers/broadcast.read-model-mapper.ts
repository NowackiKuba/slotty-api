import { Injectable } from '@nestjs/common';
import { Broadcast, BroadcastRecipient } from '@broadcasts/domain/aggregates';
import type {
  BroadcastDetailReadModel,
  BroadcastReadModel,
  BroadcastRecipientReadModel,
} from '../read-models';

@Injectable()
export class BroadcastReadModelMapper {
  toReadModel(domain: Broadcast): BroadcastReadModel {
    const snapshot = domain.toSnapshot();

    return {
      id: snapshot.id,
      userId: snapshot.userId,
      messageText: snapshot.messageText,
      targetChannel: snapshot.targetChannel,
      status: snapshot.status,
      scheduledAt: snapshot.scheduledAt,
      sentCount: snapshot.sentCount,
      createdAt: snapshot.createdAt,
      updatedAt: snapshot.updatedAt,
    };
  }

  toRecipientReadModel(
    domain: BroadcastRecipient,
  ): BroadcastRecipientReadModel {
    const snapshot = domain.toSnapshot();

    return {
      id: snapshot.id,
      broadcastId: snapshot.broadcastId,
      customerId: snapshot.customerId,
      status: snapshot.status,
      messageId: snapshot.messageId,
      sentAt: snapshot.sentAt,
      errorMessage: snapshot.errorMessage,
      createdAt: snapshot.createdAt,
      updatedAt: snapshot.updatedAt,
    };
  }

  toDetailReadModel(
    broadcast: Broadcast,
    recipients: BroadcastRecipient[],
  ): BroadcastDetailReadModel {
    return {
      ...this.toReadModel(broadcast),
      recipients: recipients.map((recipient) =>
        this.toRecipientReadModel(recipient),
      ),
    };
  }
}
