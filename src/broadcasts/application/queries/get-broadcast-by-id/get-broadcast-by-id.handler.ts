import { Inject } from '@nestjs/common';
import { QueryHandler, type IQueryHandler } from '@common/application/cqrs';
import { getOwnedBroadcast } from '@broadcasts/application/get-owned-broadcast';
import { BroadcastReadModelMapper } from '@broadcasts/application/mappers';
import type { BroadcastDetailReadModel } from '@broadcasts/application/read-models';
import type {
  IBroadcastRecipientRepository,
  IBroadcastRepository,
} from '@broadcasts/domain/repositories';
import {
  BROADCAST_RECIPIENT_REPOSITORY,
  BROADCAST_REPOSITORY,
} from '@broadcasts/domain/tokens';
import { GetBroadcastByIdQuery } from './get-broadcast-by-id.query';

@QueryHandler(GetBroadcastByIdQuery)
export class GetBroadcastByIdHandler implements IQueryHandler<
  GetBroadcastByIdQuery,
  BroadcastDetailReadModel
> {
  constructor(
    private readonly mapper: BroadcastReadModelMapper,
    @Inject(BROADCAST_REPOSITORY)
    private readonly broadcastRepository: IBroadcastRepository,
    @Inject(BROADCAST_RECIPIENT_REPOSITORY)
    private readonly recipientRepository: IBroadcastRecipientRepository,
  ) {}

  async execute(
    query: GetBroadcastByIdQuery,
  ): Promise<BroadcastDetailReadModel> {
    const { broadcastId, userId } = query.payload;
    const broadcast = await getOwnedBroadcast(
      this.broadcastRepository,
      broadcastId,
      userId,
    );
    const recipients =
      await this.recipientRepository.listByBroadcastId(broadcastId);

    return this.mapper.toDetailReadModel(broadcast, recipients);
  }
}
