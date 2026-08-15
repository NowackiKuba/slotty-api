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
import { CustomerPackage } from '@packages/domain/aggregates';
import { ICustomerPackageRepository } from '@packages/domain/repositories';
import { UserMikroOrmEntity } from '@users/infrastructure/persistence/entities';
import {
  CustomerPackageMikroOrmEntity,
  PackageTemplateMikroOrmEntity,
} from '../entities';
import { CustomerPackagePersistenceMapper } from '../mappers';

const POPULATE = ['user', 'customer', 'packageTemplate'] as const;

@Injectable()
export class CustomerPackageMikroOrmRepository implements ICustomerPackageRepository {
  constructor(
    private readonly mapper: CustomerPackagePersistenceMapper,
    private readonly em: EntityManager,
    @InjectRepository(CustomerPackageMikroOrmEntity)
    private readonly repository: EntityRepository<CustomerPackageMikroOrmEntity>,
  ) {}

  async findById(id: string): Promise<CustomerPackage | null> {
    const customerPackage = await this.repository.findOne(
      { id },
      { populate: [...POPULATE] },
    );

    return customerPackage ? this.mapper.toDomain(customerPackage) : null;
  }

  async findByIdIncludingDeleted(id: string): Promise<CustomerPackage | null> {
    const customerPackage = await this.repository.findOne(
      { id },
      {
        populate: [...POPULATE],
        filters: { [SOFT_DELETE_FILTER]: false },
      },
    );

    return customerPackage ? this.mapper.toDomain(customerPackage) : null;
  }

  async findByUserId(
    userId: string,
    query: PaginationInput,
  ): Promise<PaginatedResult<CustomerPackage>> {
    const { limit, page } = query;
    const [packages, totalCount] = await this.repository.findAndCount(
      { user: userId },
      {
        populate: [...POPULATE],
        limit,
        offset: getOffset({ limit, page }),
        orderBy: { createdAt: 'DESC' },
      },
    );

    return PaginatedResult.create(
      packages.map((row) => this.mapper.toDomain(row)),
      totalCount,
      query,
    );
  }

  async listByCustomerId(
    userId: string,
    customerId: string,
  ): Promise<CustomerPackage[]> {
    const packages = await this.repository.find(
      { user: userId, customer: customerId },
      { populate: [...POPULATE], orderBy: { createdAt: 'DESC' } },
    );

    return packages.map((row) => this.mapper.toDomain(row));
  }

  async save(customerPackage: CustomerPackage): Promise<void> {
    const user = this.em.getReference(
      UserMikroOrmEntity,
      customerPackage.userId.value,
    );
    const customer = this.em.getReference(
      CustomerMikroOrmEntity,
      customerPackage.customerId.value,
    );
    const packageTemplate = customerPackage.packageTemplateId
      ? this.em.getReference(
          PackageTemplateMikroOrmEntity,
          customerPackage.packageTemplateId.value,
        )
      : null;
    const entity = this.mapper.toPersistence(
      customerPackage,
      user,
      customer,
      packageTemplate,
    );

    await this.repository.upsert(entity);
  }
}
