import { generateUUID } from '@common/uuid';
import { BaseEntity } from '@database/base.entity';
import { Entity, Index, Property, Unique } from '@mikro-orm/core';

export type AuthIdentityMikroOrmEntityProps = {
  id?: string;
  userId: string;
  provider: string;
  providerUserId: string;
  email?: string | null;
  createdAt?: Date;
  updatedAt?: Date;
  deletedAt?: Date | null;
};

@Entity({ tableName: 'auth_identities' })
@Unique({ properties: ['provider', 'providerUserId'] })
@Index({ properties: ['userId'] })
export class AuthIdentityMikroOrmEntity
  extends BaseEntity
  implements AuthIdentityMikroOrmEntityProps
{
  @Property({ type: 'uuid' })
  userId: string;

  @Property({ type: 'text' })
  provider: string;

  @Property({ type: 'text' })
  providerUserId: string;

  @Property({ type: 'text', nullable: true })
  email?: string | null;

  constructor(props: AuthIdentityMikroOrmEntityProps) {
    super();
    this.id = props.id ?? generateUUID();
    this.userId = props.userId;
    this.provider = props.provider;
    this.providerUserId = props.providerUserId;
    this.email = props.email ?? null;
    if (props.createdAt) this.createdAt = props.createdAt;
    if (props.updatedAt) this.updatedAt = props.updatedAt;
    this.deletedAt = props.deletedAt ?? null;
  }
}
