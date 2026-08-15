import { CustomerMikroOrmEntity } from '@customers/infrastructure/persistence/entities';
import { UserMikroOrmEntity } from '@users/infrastructure/persistence/entities';
import { MessageChannel, MessageSender } from '@messages/domain/enums';
import {
  Entity,
  Enum,
  Index,
  ManyToOne,
  Property,
  Unique,
} from '@mikro-orm/core';
import { BaseEntity } from '@database/base.entity';
import { generateUUID } from '@common/uuid';
import { type MessageMetadata } from '@messages/domain/types';

export type MessageMikroOrmEntityProps = {
  id?: string;
  user: UserMikroOrmEntity;
  customer: CustomerMikroOrmEntity;
  messageContent: string;
  sender: MessageSender;
  externalMessageId: string;
  channel: MessageChannel;
  metadata?: MessageMetadata;
  createdAt?: Date;
  updatedAt?: Date;
  deletedAt?: Date | null;
};

@Entity({ tableName: 'messages' })
@Index({ properties: ['user', 'createdAt'] })
@Index({ properties: ['user', 'customer', 'createdAt'] })
@Unique({ properties: ['user', 'channel', 'externalMessageId'] })
export class MessageMikroOrmEntity
  extends BaseEntity
  implements MessageMikroOrmEntityProps
{
  @ManyToOne(() => UserMikroOrmEntity)
  user: UserMikroOrmEntity;
  @ManyToOne(() => CustomerMikroOrmEntity)
  customer: CustomerMikroOrmEntity;
  @Property({ type: 'text' })
  messageContent: string;
  @Enum(() => MessageSender)
  sender: MessageSender;
  @Property({ type: 'text' })
  externalMessageId: string;
  @Property({ type: 'jsonb', nullable: true })
  metadata?: MessageMetadata;
  @Enum(() => MessageChannel)
  channel: MessageChannel;

  constructor(props: MessageMikroOrmEntityProps) {
    super();
    this.id = props.id ?? generateUUID();
    this.user = props.user;
    this.customer = props.customer;
    this.metadata = props.metadata;
    this.messageContent = props.messageContent;
    this.sender = props.sender;
    this.externalMessageId = props.externalMessageId;
    this.channel = props.channel;
    if (props.createdAt) this.createdAt = props.createdAt;
    if (props.updatedAt) this.updatedAt = props.updatedAt;
    this.deletedAt = props.deletedAt;
  }
}
