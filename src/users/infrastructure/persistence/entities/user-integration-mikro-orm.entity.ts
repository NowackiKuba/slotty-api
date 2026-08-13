import { generateUUID } from '@common/uuid';
import { BaseEntity } from '@database/base.entity';
import {
  IntegrationProviderEnum,
  IntegrationStatusEnum,
} from '@users/domain/enums';
import type { IntegrationSettings } from '@users/domain/types';
import { Entity, Enum, ManyToOne, Property, Unique } from '@mikro-orm/core';
import { UserMikroOrmEntity } from './user-mikro-orm.entity';

export type UserIntegrationMikroOrmEntityProps = {
  id?: string;
  user: UserMikroOrmEntity;
  provider: IntegrationProviderEnum;
  status?: IntegrationStatusEnum;
  externalAccountId?: string | null;
  accessToken?: string | null;
  refreshToken?: string | null;
  expiresAt?: Date | null;
  scopes?: string[];
  settings?: IntegrationSettings;
  lastSyncedAt?: Date | null;
  errorMessage?: string | null;
  createdAt?: Date;
  updatedAt?: Date;
  deletedAt?: Date | null;
};

@Entity({ tableName: 'user_integrations' })
@Unique({ properties: ['user', 'provider'] })
export class UserIntegrationMikroOrmEntity
  extends BaseEntity
  implements UserIntegrationMikroOrmEntityProps
{
  @ManyToOne(() => UserMikroOrmEntity)
  user: UserMikroOrmEntity;

  @Enum(() => IntegrationProviderEnum)
  provider: IntegrationProviderEnum;

  @Enum(() => IntegrationStatusEnum)
  status: IntegrationStatusEnum;

  @Property({ type: 'text', nullable: true })
  externalAccountId?: string | null;

  @Property({ type: 'text', nullable: true })
  accessToken?: string | null;

  @Property({ type: 'text', nullable: true })
  refreshToken?: string | null;

  @Property({ type: 'datetime', nullable: true })
  expiresAt?: Date | null;

  @Property({ type: 'jsonb' })
  scopes: string[];

  @Property({ type: 'jsonb' })
  settings: IntegrationSettings;

  @Property({ type: 'datetime', nullable: true })
  lastSyncedAt?: Date | null;

  @Property({ type: 'text', nullable: true })
  errorMessage?: string | null;

  constructor(props: UserIntegrationMikroOrmEntityProps) {
    super();
    this.id = props.id ?? generateUUID();
    this.user = props.user;
    this.provider = props.provider;
    this.status = props.status ?? IntegrationStatusEnum.CONNECTED;
    this.externalAccountId = props.externalAccountId ?? null;
    this.accessToken = props.accessToken ?? null;
    this.refreshToken = props.refreshToken ?? null;
    this.expiresAt = props.expiresAt ?? null;
    this.scopes = props.scopes ?? [];
    this.settings = props.settings ?? {};
    this.lastSyncedAt = props.lastSyncedAt ?? null;
    this.errorMessage = props.errorMessage ?? null;
    if (props.createdAt) this.createdAt = props.createdAt;
    if (props.updatedAt) this.updatedAt = props.updatedAt;
    this.deletedAt = props.deletedAt ?? null;
  }
}
