import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@mikro-orm/nestjs';
import { EntityRepository, FilterQuery } from '@mikro-orm/postgresql';
import {
  PaginationInput,
  PaginatedResult,
  getOffset,
} from '@common/pagination';
import { SOFT_DELETE_FILTER } from '@database/base.entity';
import { User } from '@users/domain/aggregates';
import { IUserRepository } from '@users/domain/repositories';
import { UserId } from '@users/domain/value-objects';
import { UserPersistenceMapper } from '../mappers/user.persistence-mapper';
import { UserMikroOrmEntity } from '../entities/user-mikro-orm.entity';

@Injectable()
export class UserMikroOrmRepository implements IUserRepository {
  constructor(
    private readonly mapper: UserPersistenceMapper,
    @InjectRepository(UserMikroOrmEntity)
    private readonly repository: EntityRepository<UserMikroOrmEntity>,
  ) {}

  async findByDisplayName(displayName: string): Promise<User | null> {
    const user = await this.repository.findOne({ displayName });

    return user ? this.mapper.toDomain(user) : null;
  }

  async findByEmail(email: string): Promise<User | null> {
    const user = await this.repository.findOne({ email });

    return user ? this.mapper.toDomain(user) : null;
  }

  async findById(id: UserId): Promise<User | null> {
    const user = await this.repository.findOne({ id: id.value });

    return user ? this.mapper.toDomain(user) : null;
  }

  async findByIdIncludingDeleted(id: UserId): Promise<User | null> {
    const user = await this.repository.findOne(
      { id: id.value },
      { filters: { [SOFT_DELETE_FILTER]: false } },
    );

    return user ? this.mapper.toDomain(user) : null;
  }

  async findMany(query: PaginationInput): Promise<PaginatedResult<User>> {
    const { limit, page } = query;

    const where: FilterQuery<UserMikroOrmEntity> = {};

    const [users, totalCount] = await this.repository.findAndCount(where, {
      limit,
      offset: getOffset({ limit, page }),
    });

    return PaginatedResult.create(
      users.map((user) => this.mapper.toDomain(user)),
      totalCount,
      query,
    );
  }

  async save(user: User): Promise<void> {
    const entity = this.mapper.toPersistence(user);

    await this.repository.upsert(entity);
  }
}
