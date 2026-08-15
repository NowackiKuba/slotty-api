import { Entity, Enum, Index, ManyToOne, Property } from '@mikro-orm/core';
import { BroadcastStatusEnum } from '@broadcasts/domain/enums';
import { generateUUID } from '@common/uuid';
import { BaseEntity } from '@database/base.entity';
import { MessageChannel } from '@messages/domain/enums';
import { UserMikroOrmEntity } from '@users/infrastructure/persistence/entities';

export type BroadcastMikroOrmEntityProps = {
  id?: string;
  user: UserMikroOrmEntity;
  messageText: string;
  targetChannel: MessageChannel;
  status: BroadcastStatusEnum;
  scheduledAt: Date;
  sentCount?: number;
  createdAt?: Date;
  updatedAt?: Date;
  deletedAt?: Date | null;
};

@Entity({ tableName: 'broadcasts' })
@Index({ properties: ['user', 'scheduledAt'] })
export class BroadcastMikroOrmEntity
  extends BaseEntity
  implements BroadcastMikroOrmEntityProps
{
  @ManyToOne(() => UserMikroOrmEntity)
  user: UserMikroOrmEntity;

  @Property({ type: 'text' })
  messageText: string;

  @Enum(() => MessageChannel)
  targetChannel: MessageChannel;

  @Enum(() => BroadcastStatusEnum)
  status: BroadcastStatusEnum;

  @Property({ type: 'timestamptz' })
  scheduledAt: Date;

  @Property({ type: 'integer' })
  sentCount: number;

  constructor(props: BroadcastMikroOrmEntityProps) {
    super();
    this.id = props.id ?? generateUUID();
    this.user = props.user;
    this.messageText = props.messageText;
    this.targetChannel = props.targetChannel;
    this.status = props.status;
    this.scheduledAt = props.scheduledAt;
    this.sentCount = props.sentCount ?? 0;
    if (props.createdAt) this.createdAt = props.createdAt;
    if (props.updatedAt) this.updatedAt = props.updatedAt;
    this.deletedAt = props.deletedAt ?? null;
  }
}
