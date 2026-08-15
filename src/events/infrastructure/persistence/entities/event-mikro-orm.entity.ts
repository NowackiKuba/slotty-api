import { Currency } from '@common/domain/enums';
import { generateUUID } from '@common/uuid';
import { CustomerMikroOrmEntity } from '@customers/infrastructure/persistence/entities';
import { BaseEntity } from '@database/base.entity';
import { EventSource, EventType } from '@events/domain/enums';
import { EventStatusEnum } from '@events/domain/value-objects';
import {
  Entity,
  Enum,
  Index,
  ManyToOne,
  Property,
  Unique,
} from '@mikro-orm/core';
import { PaymentMethod } from '@users/domain/enums';
import { UserMikroOrmEntity } from '@users/infrastructure/persistence/entities';

export type EventMikroOrmEntityProps = {
  id?: string;
  user: UserMikroOrmEntity;
  customer?: CustomerMikroOrmEntity | null;
  status: EventStatusEnum;
  type: EventType;
  isPaymentApplicableYet: boolean;
  price: number;
  paymentMethod?: PaymentMethod;
  currency: Currency;
  location?: string;
  source: EventSource;
  isPaid: boolean;
  title: string;
  description?: string;
  startDate: Date;
  endDate: Date;
  googleCalendarId?: string; // ID kalendarza (np. 'primary')
  googleEventId?: string;
  preSessionPlan?: string; // Co zaplanowano na ten trening
  postSessionNotes?: string; // Notatka trenera po treningu
  createdAt?: Date;
  updatedAt?: Date;
  deletedAt?: Date | null;
};

@Entity({ tableName: 'events' })
@Index({ properties: ['user', 'startDate'] })
@Index({ properties: ['customer', 'startDate'] })
@Unique({ properties: ['user', 'googleEventId'] })
export class EventMikroOrmEntity
  extends BaseEntity
  implements EventMikroOrmEntityProps
{
  @ManyToOne(() => UserMikroOrmEntity)
  user: UserMikroOrmEntity;
  @ManyToOne(() => CustomerMikroOrmEntity, { nullable: true })
  customer?: CustomerMikroOrmEntity | null;
  @Enum(() => EventStatusEnum)
  status: EventStatusEnum;
  @Enum(() => EventType)
  type: EventType;
  @Property({ type: 'boolean' })
  isPaymentApplicableYet: boolean;
  @Property({ type: 'integer' })
  price: number;
  @Enum({
    items: () => PaymentMethod,
    nullable: true,
  })
  paymentMethod?: PaymentMethod;
  @Enum(() => Currency)
  currency: Currency;
  @Property({ type: 'text', nullable: true })
  location?: string;
  @Enum(() => EventSource)
  source: EventSource;
  @Property({ type: 'boolean' })
  isPaid: boolean;
  @Property({ type: 'text' })
  title: string;
  @Property({ type: 'text', nullable: true })
  description?: string;
  @Property({ type: 'timestamptz' })
  startDate: Date;
  @Property({ type: 'timestamptz' })
  endDate: Date;
  @Property({ type: 'text', nullable: true })
  googleCalendarId?: string; // ID kalendarza (np. 'primary')
  @Property({ type: 'text', nullable: true })
  googleEventId?: string;
  @Property({ type: 'text', nullable: true })
  preSessionPlan?: string; // Co zaplanowano na ten trening
  @Property({ type: 'text', nullable: true })
  postSessionNotes?: string; // Notatka trenera po treningu

  constructor(props: EventMikroOrmEntityProps) {
    super();
    this.id = props.id ?? generateUUID();
    this.user = props.user;
    this.customer = props.customer;
    this.status = props.status;
    this.type = props.type;
    this.isPaymentApplicableYet = props.isPaymentApplicableYet;
    this.price = props.price;
    this.paymentMethod = props.paymentMethod;
    this.currency = props.currency;
    this.location = props.location;
    this.source = props.source;
    this.isPaid = props.isPaid;
    this.title = props.title;
    this.description = props.description;
    this.startDate = props.startDate;
    this.endDate = props.endDate;
    this.googleCalendarId = props.googleCalendarId;
    this.googleEventId = props.googleEventId;
    this.preSessionPlan = props.preSessionPlan;
    this.postSessionNotes = props.postSessionNotes;
    if (props.createdAt) this.createdAt = props.createdAt;
    if (props.updatedAt) this.updatedAt = props.updatedAt;
    this.deletedAt = props.deletedAt;
  }
}
