import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@mikro-orm/nestjs';
import { EntityManager, EntityRepository } from '@mikro-orm/postgresql';
import { BroadcastRecipient } from '@broadcasts/domain/aggregates';
import { IBroadcastRecipientRepository } from '@broadcasts/domain/repositories';
import { CustomerMikroOrmEntity } from '@customers/infrastructure/persistence/entities';
import { SOFT_DELETE_FILTER } from '@database/base.entity';
import { MessageMikroOrmEntity } from '@messages/infrastructure/persistence/entities';
import {
  BroadcastMikroOrmEntity,
  BroadcastRecipientMikroOrmEntity,
} from '../entities';
import { BroadcastRecipientPersistenceMapper } from '../mappers';

const POPULATE = ['broadcast', 'customer', 'message'] as const;

@Injectable()
export class BroadcastRecipientMikroOrmRepository implements IBroadcastRecipientRepository {
  constructor(
    private readonly mapper: BroadcastRecipientPersistenceMapper,
    private readonly em: EntityManager,
    @InjectRepository(BroadcastRecipientMikroOrmEntity)
    private readonly repository: EntityRepository<BroadcastRecipientMikroOrmEntity>,
  ) {}

  async findById(id: string): Promise<BroadcastRecipient | null> {
    const recipient = await this.repository.findOne(
      { id },
      { populate: [...POPULATE] },
    );

    return recipient ? this.mapper.toDomain(recipient) : null;
  }

  async findByBroadcastIdAndCustomerId(
    broadcastId: string,
    customerId: string,
  ): Promise<BroadcastRecipient | null> {
    const recipient = await this.repository.findOne(
      { broadcast: broadcastId, customer: customerId },
      { populate: [...POPULATE] },
    );

    return recipient ? this.mapper.toDomain(recipient) : null;
  }

  async findByBroadcastIdAndCustomerIdIncludingDeleted(
    broadcastId: string,
    customerId: string,
  ): Promise<BroadcastRecipient | null> {
    const recipient = await this.repository.findOne(
      { broadcast: broadcastId, customer: customerId },
      {
        populate: [...POPULATE],
        filters: { [SOFT_DELETE_FILTER]: false },
      },
    );

    return recipient ? this.mapper.toDomain(recipient) : null;
  }

  async listByBroadcastId(broadcastId: string): Promise<BroadcastRecipient[]> {
    const recipients = await this.repository.find(
      { broadcast: broadcastId },
      { populate: [...POPULATE], orderBy: { createdAt: 'ASC' } },
    );

    return recipients.map((recipient) => this.mapper.toDomain(recipient));
  }

  async listByBroadcastIdIncludingDeleted(
    broadcastId: string,
  ): Promise<BroadcastRecipient[]> {
    const recipients = await this.repository.find(
      { broadcast: broadcastId },
      {
        populate: [...POPULATE],
        filters: { [SOFT_DELETE_FILTER]: false },
        orderBy: { createdAt: 'ASC' },
      },
    );

    return recipients.map((recipient) => this.mapper.toDomain(recipient));
  }

  async save(recipient: BroadcastRecipient): Promise<void> {
    const broadcast = this.em.getReference(
      BroadcastMikroOrmEntity,
      recipient.broadcastId.value,
    );
    const customer = this.em.getReference(
      CustomerMikroOrmEntity,
      recipient.customerId.value,
    );
    const message = recipient.messageId
      ? this.em.getReference(MessageMikroOrmEntity, recipient.messageId.value)
      : null;
    const entity = this.mapper.toPersistence(
      recipient,
      broadcast,
      customer,
      message,
    );

    await this.repository.upsert(entity);
  }
}
