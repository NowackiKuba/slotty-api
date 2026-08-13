import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@mikro-orm/nestjs';
import { EntityManager, EntityRepository } from '@mikro-orm/postgresql';
import {
  PaginationInput,
  PaginatedResult,
  getOffset,
} from '@common/pagination';
import { Customer } from '@customers/domain/aggregates';
import { ICustomerRepository } from '@customers/domain/repositories';
import { SOFT_DELETE_FILTER } from '@database/base.entity';
import { UserMikroOrmEntity } from '@users/infrastructure/persistence/entities';
import { CustomerMikroOrmEntity } from '../entities/customer-mikro-orm.entity';
import { CustomerPersistenceMapper } from '../mappers/customer.persistence-mapper';

@Injectable()
export class CustomerMikroOrmRepository implements ICustomerRepository {
  constructor(
    private readonly mapper: CustomerPersistenceMapper,
    private readonly em: EntityManager,
    @InjectRepository(CustomerMikroOrmEntity)
    private readonly repository: EntityRepository<CustomerMikroOrmEntity>,
  ) {}

  async findById(id: string): Promise<Customer | null> {
    const customer = await this.repository.findOne(
      { id },
      { populate: ['user'] },
    );

    return customer ? this.mapper.toDomain(customer) : null;
  }

  async findByIdIncludingDeleted(id: string): Promise<Customer | null> {
    const customer = await this.repository.findOne(
      { id },
      {
        populate: ['user'],
        filters: { [SOFT_DELETE_FILTER]: false },
      },
    );

    return customer ? this.mapper.toDomain(customer) : null;
  }

  async findByUserId(
    userId: string,
    query: PaginationInput,
  ): Promise<PaginatedResult<Customer>> {
    const { limit, page } = query;
    const [customers, totalCount] = await this.repository.findAndCount(
      { user: userId },
      {
        populate: ['user'],
        limit,
        offset: getOffset({ limit, page }),
        orderBy: { createdAt: 'DESC' },
      },
    );

    return PaginatedResult.create(
      customers.map((customer) => this.mapper.toDomain(customer)),
      totalCount,
      query,
    );
  }

  async findByUserIdAndEmail(
    userId: string,
    email: string,
  ): Promise<Customer | null> {
    const customer = await this.repository.findOne(
      { user: userId, email: email.toLowerCase() },
      { populate: ['user'] },
    );

    return customer ? this.mapper.toDomain(customer) : null;
  }

  async findByUserIdAndPhone(
    userId: string,
    phoneNumber: string,
  ): Promise<Customer | null> {
    const customer = await this.repository.findOne(
      { user: userId, phoneNumber: phoneNumber.replace(/[\s-]/g, '') },
      { populate: ['user'] },
    );

    return customer ? this.mapper.toDomain(customer) : null;
  }

  async findByUserIdAndInstagramAccountId(
    userId: string,
    instagramAccountId: string,
  ): Promise<Customer | null> {
    const customer = await this.repository.findOne(
      { user: userId, instagramAccountId },
      { populate: ['user'] },
    );

    return customer ? this.mapper.toDomain(customer) : null;
  }

  async findByUserIdAndWhatsappAccountId(
    userId: string,
    whatsappAccountId: string,
  ): Promise<Customer | null> {
    const customer = await this.repository.findOne(
      { user: userId, whatsappAccountId },
      { populate: ['user'] },
    );

    return customer ? this.mapper.toDomain(customer) : null;
  }

  async save(customer: Customer): Promise<void> {
    const user = this.em.getReference(
      UserMikroOrmEntity,
      customer.userId.value,
    );
    const entity = this.mapper.toPersistence(customer, user);

    await this.repository.upsert(entity);
  }
}
