import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@mikro-orm/nestjs';
import { EntityManager, EntityRepository } from '@mikro-orm/postgresql';
import {
  PaginationInput,
  PaginatedResult,
  getOffset,
} from '@common/pagination';
import { CustomerMikroOrmEntity } from '@customers/infrastructure/persistence/entities';
import { SOFT_DELETE_FILTER } from '@database/base.entity';
import { Message } from '@messages/domain/aggregates';
import { MessageChannel } from '@messages/domain/enums';
import { IMessageRepository } from '@messages/domain/repositories';
import { UserMikroOrmEntity } from '@users/infrastructure/persistence/entities';
import { MessageMikroOrmEntity } from '../entities';
import { MessagePersistenceMapper } from '../mappers';

const POPULATE = ['user', 'customer'] as const;

@Injectable()
export class MessageMikroOrmRepository implements IMessageRepository {
  constructor(
    private readonly mapper: MessagePersistenceMapper,
    private readonly em: EntityManager,
    @InjectRepository(MessageMikroOrmEntity)
    private readonly repository: EntityRepository<MessageMikroOrmEntity>,
  ) {}

  async findById(id: string): Promise<Message | null> {
    const message = await this.repository.findOne(
      { id },
      { populate: [...POPULATE] },
    );

    return message ? this.mapper.toDomain(message) : null;
  }

  async findByIdIncludingDeleted(id: string): Promise<Message | null> {
    const message = await this.repository.findOne(
      { id },
      {
        populate: [...POPULATE],
        filters: { [SOFT_DELETE_FILTER]: false },
      },
    );

    return message ? this.mapper.toDomain(message) : null;
  }

  async findByUserId(
    userId: string,
    query: PaginationInput,
  ): Promise<PaginatedResult<Message>> {
    const { limit, page } = query;
    const [messages, totalCount] = await this.repository.findAndCount(
      { user: userId },
      {
        populate: [...POPULATE],
        limit,
        offset: getOffset({ limit, page }),
        orderBy: { createdAt: 'DESC' },
      },
    );

    return PaginatedResult.create(
      messages.map((message) => this.mapper.toDomain(message)),
      totalCount,
      query,
    );
  }

  async findByCustomerId(
    userId: string,
    customerId: string,
    query: PaginationInput,
  ): Promise<PaginatedResult<Message>> {
    const { limit, page } = query;
    const [messages, totalCount] = await this.repository.findAndCount(
      { user: userId, customer: customerId },
      {
        populate: [...POPULATE],
        limit,
        offset: getOffset({ limit, page }),
        orderBy: { createdAt: 'ASC' },
      },
    );

    return PaginatedResult.create(
      messages.map((message) => this.mapper.toDomain(message)),
      totalCount,
      query,
    );
  }

  async findByExternalMessageId(
    userId: string,
    channel: MessageChannel,
    externalMessageId: string,
  ): Promise<Message | null> {
    const message = await this.repository.findOne(
      { user: userId, channel, externalMessageId },
      { populate: [...POPULATE] },
    );

    return message ? this.mapper.toDomain(message) : null;
  }

  async save(message: Message): Promise<void> {
    const user = this.em.getReference(UserMikroOrmEntity, message.userId.value);
    const customer = this.em.getReference(
      CustomerMikroOrmEntity,
      message.customerId.value,
    );
    const entity = this.mapper.toPersistence(message, user, customer);

    await this.repository.upsert(entity);
  }
}
