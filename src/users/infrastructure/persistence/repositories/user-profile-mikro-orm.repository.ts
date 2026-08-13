import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@mikro-orm/nestjs';
import { EntityManager, EntityRepository } from '@mikro-orm/postgresql';
import { SOFT_DELETE_FILTER } from '@database/base.entity';
import { UserProfile } from '@users/domain/aggregates';
import { IUserProfileRepository } from '@users/domain/repositories';
import { UserId, UserProfileId } from '@users/domain/value-objects';
import { UserMikroOrmEntity } from '../entities/user-mikro-orm.entity';
import { UserProfileMikroOrmEntity } from '../entities/user-profile-mikro-orm.entity';
import { UserProfilePersistenceMapper } from '../mappers/user-profile.persistence-mapper';

@Injectable()
export class UserProfileMikroOrmRepository implements IUserProfileRepository {
  constructor(
    private readonly mapper: UserProfilePersistenceMapper,
    private readonly em: EntityManager,
    @InjectRepository(UserProfileMikroOrmEntity)
    private readonly repository: EntityRepository<UserProfileMikroOrmEntity>,
  ) {}

  async findById(id: UserProfileId): Promise<UserProfile | null> {
    const profile = await this.repository.findOne(
      { id: id.value },
      { populate: ['user'] },
    );

    return profile ? this.mapper.toDomain(profile) : null;
  }

  async findByIdIncludingDeleted(id: UserProfileId): Promise<UserProfile | null> {
    const profile = await this.repository.findOne(
      { id: id.value },
      {
        populate: ['user'],
        filters: { [SOFT_DELETE_FILTER]: false },
      },
    );

    return profile ? this.mapper.toDomain(profile) : null;
  }

  async findByUserId(userId: UserId): Promise<UserProfile | null> {
    const profile = await this.repository.findOne(
      { user: userId.value },
      { populate: ['user'] },
    );

    return profile ? this.mapper.toDomain(profile) : null;
  }

  async save(profile: UserProfile): Promise<void> {
    const user = this.em.getReference(UserMikroOrmEntity, profile.userId.value);
    const entity = this.mapper.toPersistence(profile, user);

    await this.repository.upsert(entity);
  }
}
