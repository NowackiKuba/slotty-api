import { Query } from '@common/application/cqrs';
import type { BroadcastDetailReadModel } from '@broadcasts/application/read-models';

export type GetBroadcastByIdPayload = {
  userId: string;
  broadcastId: string;
};

export class GetBroadcastByIdQuery extends Query<
  GetBroadcastByIdPayload,
  BroadcastDetailReadModel
> {
  constructor(payload: GetBroadcastByIdPayload) {
    super(payload);
  }
}
