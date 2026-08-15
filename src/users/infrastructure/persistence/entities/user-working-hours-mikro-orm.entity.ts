import { BaseEntity } from '@database/base.entity';
import { UserMikroOrmEntity } from './user-mikro-orm.entity';
import { Entity, ManyToOne, Property, Unique } from '@mikro-orm/core';
import { generateUUID } from '@common/uuid';

export type UserWorkingHoursMikroOrmEntityProps = {
  id?: string;
  user: UserMikroOrmEntity;
  dayOfWeek: number; // 1 (Poniedziałek) do 7 (Niedziela)
  startTime: string; // np. "08:00"
  endTime: string; // np. "16:00"
  isDayOff: boolean; // Czy całościowo wolne
  createdAt?: Date;
  updatedAt?: Date;
  deletedAt?: Date | null;
};

@Entity({ tableName: 'user_working_hours' })
@Unique({ properties: ['user', 'dayOfWeek'] })
export class UserWorkingHoursMikroOrmEntity
  extends BaseEntity
  implements UserWorkingHoursMikroOrmEntityProps
{
  @ManyToOne(() => UserMikroOrmEntity)
  user: UserMikroOrmEntity;
  @Property({ type: 'integer' })
  dayOfWeek: number; // 1 (Poniedziałek) do 7 (Niedziela)
  @Property({ type: 'text' })
  startTime: string; // np. "08:00"
  @Property({ type: 'text' })
  endTime: string; // np. "16:00"
  @Property({ type: 'boolean' })
  isDayOff: boolean; // Czy całościowo wolne

  constructor(props: UserWorkingHoursMikroOrmEntityProps) {
    super();
    this.id = props.id ?? generateUUID();
    this.user = props.user;
    this.dayOfWeek = props.dayOfWeek;
    this.startTime = props.startTime;
    this.endTime = props.endTime;
    this.isDayOff = props.isDayOff;
    if (props.createdAt) this.createdAt = props.createdAt;
    if (props.updatedAt) this.updatedAt = props.updatedAt;
    this.deletedAt = props.deletedAt;
  }
}
