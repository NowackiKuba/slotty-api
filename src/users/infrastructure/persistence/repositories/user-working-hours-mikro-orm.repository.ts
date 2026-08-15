import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@mikro-orm/nestjs';
import { EntityManager, EntityRepository } from '@mikro-orm/postgresql';
import { SOFT_DELETE_FILTER } from '@database/base.entity';
import { UserWorkingHours } from '@users/domain/aggregates';
import { IUserWorkingHoursRepository } from '@users/domain/repositories';
import { UserMikroOrmEntity } from '../entities/user-mikro-orm.entity';
import { UserWorkingHoursMikroOrmEntity } from '../entities/user-working-hours-mikro-orm.entity';
import { UserWorkingHoursPersistenceMapper } from '../mappers/user-working-hours.persistence-mapper';

@Injectable()
export class UserWorkingHoursMikroOrmRepository implements IUserWorkingHoursRepository {
  constructor(
    private readonly mapper: UserWorkingHoursPersistenceMapper,
    private readonly em: EntityManager,
    @InjectRepository(UserWorkingHoursMikroOrmEntity)
    private readonly repository: EntityRepository<UserWorkingHoursMikroOrmEntity>,
  ) {}

  async findById(id: string): Promise<UserWorkingHours | null> {
    const workingHours = await this.repository.findOne(
      { id },
      { populate: ['user'] },
    );

    return workingHours ? this.mapper.toDomain(workingHours) : null;
  }

  async findByUserIdAndDayOfWeek(
    userId: string,
    dayOfWeek: number,
  ): Promise<UserWorkingHours | null> {
    const workingHours = await this.repository.findOne(
      { user: userId, dayOfWeek },
      { populate: ['user'] },
    );

    return workingHours ? this.mapper.toDomain(workingHours) : null;
  }

  async findByUserIdAndDayOfWeekIncludingDeleted(
    userId: string,
    dayOfWeek: number,
  ): Promise<UserWorkingHours | null> {
    const workingHours = await this.repository.findOne(
      { user: userId, dayOfWeek },
      {
        populate: ['user'],
        filters: { [SOFT_DELETE_FILTER]: false },
      },
    );

    return workingHours ? this.mapper.toDomain(workingHours) : null;
  }

  async listByUserId(userId: string): Promise<UserWorkingHours[]> {
    const workingHours = await this.repository.find(
      { user: userId },
      { populate: ['user'], orderBy: { dayOfWeek: 'ASC' } },
    );

    return workingHours.map((row) => this.mapper.toDomain(row));
  }

  async save(workingHours: UserWorkingHours): Promise<void> {
    const user = this.em.getReference(
      UserMikroOrmEntity,
      workingHours.userId.value,
    );
    const entity = this.mapper.toPersistence(workingHours, user);

    await this.repository.upsert(entity);
  }
}
