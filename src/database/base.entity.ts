import { Entity, Filter, OptionalProps, PrimaryKey, Property } from '@mikro-orm/core';

export const SOFT_DELETE_FILTER = 'softDelete';

@Entity({ abstract: true })
@Filter({ name: SOFT_DELETE_FILTER, cond: { deletedAt: null }, default: true })
export abstract class BaseEntity {
  [OptionalProps]?: 'createdAt' | 'updatedAt' | 'deletedAt';

  @PrimaryKey({ type: 'uuid', defaultRaw: 'gen_random_uuid()' })
  id!: string;

  @Property()
  createdAt: Date = new Date();

  @Property({ onUpdate: () => new Date() })
  updatedAt: Date = new Date();

  @Property({ nullable: true })
  deletedAt?: Date | null;
}
