import { generateUUID } from '@common/uuid';
import { BaseEntity } from '@database/base.entity';
import { Entity, Property } from '@mikro-orm/core';

export type UserMikroOrmEntityProps = {
  id?: string;
  firstName: string;
  lastName: string;
  displayName: string;
  email: string;
  avatarUrl: string;
  emailVerified: boolean;
  status: string;
  subscriptionStatus: string;

  timezone: string;
  lastLoginAt?: Date;
  createdAt?: Date;
  updatedAt?: Date;
  deletedAt?: Date | null;
};

@Entity({ tableName: 'users' })
export class UserMikroOrmEntity
  extends BaseEntity
  implements UserMikroOrmEntityProps
{
  @Property({ type: 'text' })
  firstName: string;
  @Property({ type: 'text' })
  lastName: string;
  @Property({ type: 'text', unique: true })
  displayName: string;
  @Property({ type: 'text', unique: true })
  email: string;
  @Property({ type: 'text' })
  avatarUrl: string;
  @Property({ type: 'boolean', default: false })
  emailVerified: boolean;
  @Property({ type: 'text', default: 'active' })
  status: string;
  @Property({ type: 'text', default: 'free' })
  subscriptionStatus: string;
  @Property({ type: 'text', default: 'UTC' })
  timezone: string;
  @Property({ type: 'timestamptz', nullable: true })
  lastLoginAt?: Date;

  constructor(props: UserMikroOrmEntityProps) {
    super();
    this.id = props.id ?? generateUUID();
    this.firstName = props.firstName;
    this.lastName = props.lastName;
    this.displayName = props.displayName;
    this.email = props.email;
    this.avatarUrl = props.avatarUrl;
    this.emailVerified = props.emailVerified;
    this.status = props.status;
    this.subscriptionStatus = props.subscriptionStatus;
    this.timezone = props.timezone;
    this.lastLoginAt = props.lastLoginAt;
    if (props.createdAt) this.createdAt = props.createdAt;
    if (props.updatedAt) this.updatedAt = props.updatedAt;
    this.deletedAt = props.deletedAt;
  }
}
