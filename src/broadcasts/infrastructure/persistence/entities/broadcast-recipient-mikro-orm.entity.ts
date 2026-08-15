import { Entity, Enum, ManyToOne, Property, Unique } from '@mikro-orm/core';
import { BroadcastRecipientStatusEnum } from '@broadcasts/domain/enums';
import { generateUUID } from '@common/uuid';
import { CustomerMikroOrmEntity } from '@customers/infrastructure/persistence/entities';
import { BaseEntity } from '@database/base.entity';
import { MessageMikroOrmEntity } from '@messages/infrastructure/persistence/entities';
import { BroadcastMikroOrmEntity } from './broadcast-mikro-orm.entity';

export type BroadcastRecipientMikroOrmEntityProps = {
  id?: string;
  broadcast: BroadcastMikroOrmEntity;
  customer: CustomerMikroOrmEntity;
  status: BroadcastRecipientStatusEnum;
  message?: MessageMikroOrmEntity | null;
  sentAt?: Date | null;
  errorMessage?: string | null;
  createdAt?: Date;
  updatedAt?: Date;
  deletedAt?: Date | null;
};

@Entity({ tableName: 'broadcast_recipients' })
@Unique({ properties: ['broadcast', 'customer'] })
export class BroadcastRecipientMikroOrmEntity
  extends BaseEntity
  implements BroadcastRecipientMikroOrmEntityProps
{
  @ManyToOne(() => BroadcastMikroOrmEntity)
  broadcast: BroadcastMikroOrmEntity;

  @ManyToOne(() => CustomerMikroOrmEntity)
  customer: CustomerMikroOrmEntity;

  @Enum(() => BroadcastRecipientStatusEnum)
  status: BroadcastRecipientStatusEnum;

  @ManyToOne(() => MessageMikroOrmEntity, { nullable: true })
  message?: MessageMikroOrmEntity | null;

  @Property({ type: 'timestamptz', nullable: true })
  sentAt?: Date | null;

  @Property({ type: 'text', nullable: true })
  errorMessage?: string | null;

  constructor(props: BroadcastRecipientMikroOrmEntityProps) {
    super();
    this.id = props.id ?? generateUUID();
    this.broadcast = props.broadcast;
    this.customer = props.customer;
    this.status = props.status;
    this.message = props.message ?? null;
    this.sentAt = props.sentAt ?? null;
    this.errorMessage = props.errorMessage ?? null;
    if (props.createdAt) this.createdAt = props.createdAt;
    if (props.updatedAt) this.updatedAt = props.updatedAt;
    this.deletedAt = props.deletedAt ?? null;
  }
}
