import { Inject } from '@nestjs/common';
import { QueryHandler, type IQueryHandler } from '@common/application/cqrs';
import { PaginatedResult } from '@common/pagination';
import { BroadcastReadModelMapper } from '@broadcasts/application/mappers';
import type { BroadcastReadModel } from '@broadcasts/application/read-models';
import type { IBroadcastRepository } from '@broadcasts/domain/repositories';
import { BROADCAST_REPOSITORY } from '@broadcasts/domain/tokens';
import { ListBroadcastsQuery } from './list-broadcasts.query';

@QueryHandler(ListBroadcastsQuery)
export class ListBroadcastsHandler implements IQueryHandler<
  ListBroadcastsQuery,
  PaginatedResult<BroadcastReadModel>
> {
  constructor(
    private readonly mapper: BroadcastReadModelMapper,
    @Inject(BROADCAST_REPOSITORY)
    private readonly broadcastRepository: IBroadcastRepository,
  ) {}

  async execute(
    query: ListBroadcastsQuery,
  ): Promise<PaginatedResult<BroadcastReadModel>> {
    const { userId, ...pagination } = query.payload;
    const result = await this.broadcastRepository.findByUserId(
      userId,
      pagination,
    );

    return PaginatedResult.create(
      result.data.map((broadcast) => this.mapper.toReadModel(broadcast)),
      result.meta.total,
      pagination,
    );
  }
}
