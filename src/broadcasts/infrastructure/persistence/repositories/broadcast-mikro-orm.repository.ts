import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@mikro-orm/nestjs';
import { EntityManager, EntityRepository } from '@mikro-orm/postgresql';
import {
  PaginationInput,
  PaginatedResult,
  getOffset,
} from '@common/pagination';
import { Broadcast } from '@broadcasts/domain/aggregates';
import { IBroadcastRepository } from '@broadcasts/domain/repositories';
import { SOFT_DELETE_FILTER } from '@database/base.entity';
import { UserMikroOrmEntity } from '@users/infrastructure/persistence/entities';
import { BroadcastMikroOrmEntity } from '../entities';
import { BroadcastPersistenceMapper } from '../mappers';

@Injectable()
export class BroadcastMikroOrmRepository implements IBroadcastRepository {
  constructor(
    private readonly mapper: BroadcastPersistenceMapper,
    private readonly em: EntityManager,
    @InjectRepository(BroadcastMikroOrmEntity)
    private readonly repository: EntityRepository<BroadcastMikroOrmEntity>,
  ) {}

  async findById(id: string): Promise<Broadcast | null> {
    const broadcast = await this.repository.findOne(
      { id },
      { populate: ['user'] },
    );

    return broadcast ? this.mapper.toDomain(broadcast) : null;
  }

  async findByIdIncludingDeleted(id: string): Promise<Broadcast | null> {
    const broadcast = await this.repository.findOne(
      { id },
      {
        populate: ['user'],
        filters: { [SOFT_DELETE_FILTER]: false },
      },
    );

    return broadcast ? this.mapper.toDomain(broadcast) : null;
  }

  async findByUserId(
    userId: string,
    query: PaginationInput,
  ): Promise<PaginatedResult<Broadcast>> {
    const { limit, page } = query;
    const [broadcasts, totalCount] = await this.repository.findAndCount(
      { user: userId },
      {
        populate: ['user'],
        limit,
        offset: getOffset({ limit, page }),
        orderBy: { scheduledAt: 'DESC' },
      },
    );

    return PaginatedResult.create(
      broadcasts.map((broadcast) => this.mapper.toDomain(broadcast)),
      totalCount,
      query,
    );
  }

  async save(broadcast: Broadcast): Promise<void> {
    const user = this.em.getReference(
      UserMikroOrmEntity,
      broadcast.userId.value,
    );
    const entity = this.mapper.toPersistence(broadcast, user);

    await this.repository.upsert(entity);
  }
}
