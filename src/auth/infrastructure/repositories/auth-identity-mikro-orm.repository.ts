import { InjectRepository } from '@mikro-orm/nestjs';
import { EntityRepository } from '@mikro-orm/postgresql';
import { Injectable } from '@nestjs/common';
import { AuthIdentity } from '@auth/domain/aggregates';
import { IAuthIdentityRepository } from '@auth/domain/repositories';
import { AuthProvider } from '@auth/domain/value-objects';
import { UserId } from '@users/domain/value-objects';
import { AuthIdentityPersistenceMapper } from '../mappers/auth-identity.persistence-mapper';
import { AuthIdentityMikroOrmEntity } from '../persistence/auth-identity-mikro-orm.entity';

@Injectable()
export class AuthIdentityMikroOrmRepository implements IAuthIdentityRepository {
  constructor(
    private readonly mapper: AuthIdentityPersistenceMapper,
    @InjectRepository(AuthIdentityMikroOrmEntity)
    private readonly repository: EntityRepository<AuthIdentityMikroOrmEntity>,
  ) {}

  async findByProvider(
    provider: AuthProvider,
    providerUserId: string,
  ): Promise<AuthIdentity | null> {
    const entity = await this.repository.findOne({
      provider: provider.value,
      providerUserId,
    });

    return entity ? this.mapper.toDomain(entity) : null;
  }

  async findByUserId(userId: UserId): Promise<AuthIdentity[]> {
    const entities = await this.repository.find({ userId: userId.value });

    return entities.map((entity) => this.mapper.toDomain(entity));
  }

  async save(identity: AuthIdentity): Promise<void> {
    const entity = this.mapper.toPersistence(identity);
    await this.repository.upsert(entity);
  }
}
