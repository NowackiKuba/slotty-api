import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@mikro-orm/nestjs';
import { EntityManager, EntityRepository } from '@mikro-orm/postgresql';
import {
  PaginationInput,
  PaginatedResult,
  getOffset,
} from '@common/pagination';
import { CustomerMikroOrmEntity } from '@customers/infrastructure/persistence/entities';
import { Event } from '@events/domain/aggregates';
import { IEventRepository } from '@events/domain/repositories';
import { SOFT_DELETE_FILTER } from '@database/base.entity';
import { UserMikroOrmEntity } from '@users/infrastructure/persistence/entities';
import { EventMikroOrmEntity } from '../entities/event-mikro-orm.entity';
import { EventPersistenceMapper } from '../mappers/event.persistence-mapper';

const POPULATE = ['user', 'customer'] as const;

@Injectable()
export class EventMikroOrmRepository implements IEventRepository {
  constructor(
    private readonly mapper: EventPersistenceMapper,
    private readonly em: EntityManager,
    @InjectRepository(EventMikroOrmEntity)
    private readonly repository: EntityRepository<EventMikroOrmEntity>,
  ) {}

  async findById(id: string): Promise<Event | null> {
    const event = await this.repository.findOne(
      { id },
      { populate: [...POPULATE] },
    );

    return event ? this.mapper.toDomain(event) : null;
  }

  async findByIdIncludingDeleted(id: string): Promise<Event | null> {
    const event = await this.repository.findOne(
      { id },
      {
        populate: [...POPULATE],
        filters: { [SOFT_DELETE_FILTER]: false },
      },
    );

    return event ? this.mapper.toDomain(event) : null;
  }

  async findByUserId(
    userId: string,
    query: PaginationInput,
  ): Promise<PaginatedResult<Event>> {
    const { limit, page } = query;
    const [events, totalCount] = await this.repository.findAndCount(
      { user: userId },
      {
        populate: [...POPULATE],
        limit,
        offset: getOffset({ limit, page }),
        orderBy: { startDate: 'DESC' },
      },
    );

    return PaginatedResult.create(
      events.map((event) => this.mapper.toDomain(event)),
      totalCount,
      query,
    );
  }

  async findByUserIdInRange(
    userId: string,
    from: Date,
    to: Date,
  ): Promise<Event[]> {
    const events = await this.repository.find(
      {
        user: userId,
        startDate: { $lt: to },
        endDate: { $gt: from },
      },
      {
        populate: [...POPULATE],
        orderBy: { startDate: 'ASC' },
      },
    );

    return events.map((event) => this.mapper.toDomain(event));
  }

  async findByCustomerIdInRange(
    customerId: string,
    from: Date,
    to: Date,
  ): Promise<Event[]> {
    const events = await this.repository.find(
      {
        customer: customerId,
        startDate: { $lt: to },
        endDate: { $gt: from },
      },
      {
        populate: [...POPULATE],
        orderBy: { startDate: 'ASC' },
      },
    );

    return events.map((event) => this.mapper.toDomain(event));
  }

  async findByGoogleEventId(
    userId: string,
    googleEventId: string,
  ): Promise<Event | null> {
    const event = await this.repository.findOne(
      { user: userId, googleEventId },
      { populate: [...POPULATE] },
    );

    return event ? this.mapper.toDomain(event) : null;
  }

  async findOverlapping(
    userId: string,
    startDate: Date,
    endDate: Date,
    excludeEventId?: string,
  ): Promise<Event[]> {
    const events = await this.repository.find(
      {
        user: userId,
        startDate: { $lt: endDate },
        endDate: { $gt: startDate },
        ...(excludeEventId ? { id: { $ne: excludeEventId } } : {}),
      },
      {
        populate: [...POPULATE],
        orderBy: { startDate: 'ASC' },
      },
    );

    return events.map((event) => this.mapper.toDomain(event));
  }

  async save(event: Event): Promise<void> {
    const user = this.em.getReference(UserMikroOrmEntity, event.userId.value);
    const customer = event.customerId
      ? this.em.getReference(CustomerMikroOrmEntity, event.customerId.value)
      : null;
    const entity = this.mapper.toPersistence(event, user, customer);

    await this.repository.upsert(entity);
  }
}
