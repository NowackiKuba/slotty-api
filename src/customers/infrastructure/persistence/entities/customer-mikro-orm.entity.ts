import { generateUUID } from '@common/uuid';
import { CustomerSource } from '@customers/domain/enums';
import { CustomerStatusEnum } from '@customers/domain/value-objects';
import { BaseEntity } from '@database/base.entity';
import { Entity, Enum, ManyToOne, Property, Unique } from '@mikro-orm/core';
import { UserMikroOrmEntity } from '@users/infrastructure/persistence/entities';

export type CustomerMikroOrmEntityProps = {
  id?: string;
  user: UserMikroOrmEntity; // Trener
  source: CustomerSource;
  firstName: string;
  lastName?: string;
  nickname?: string;
  email?: string;
  phoneNumber?: string;
  avatarUrl?: string;
  instagramAccountId?: string;
  whatsappAccountId?: string;
  equipmentToBring?: string[]; // np. ['Rakieta testowa (klubowa)', 'Owijka', 'Piłki PRO']
  focusAreas?: string[]; // np. ['Serwis', 'Wybicie z szyby', 'Kondycja']
  healthNotes?: string; // np. "Ból w prawym łokciu", "Słabe kolano" - KRYTYCZNE!
  generalNotes?: string; // Dowolne uwagi trenera
  status: CustomerStatusEnum;
  aiOptOut?: boolean; // Wyłączenie bota dla tego klienta
  preferredLanguage?: string; // default: 'pl'
  totalSessionsCount?: number;
  noShowCount?: number;
  createdAt?: Date;
  updatedAt?: Date;
  deletedAt?: Date | null;
};

@Entity({ tableName: 'customers' })
@Unique({ properties: ['user', 'instagramAccountId'] })
@Unique({ properties: ['user', 'whatsappAccountId'] })
@Unique({ properties: ['user', 'phoneNumber'] })
@Unique({ properties: ['user', 'email'] })
export class CustomerMikroOrmEntity
  extends BaseEntity
  implements CustomerMikroOrmEntityProps
{
  @ManyToOne(() => UserMikroOrmEntity)
  user: UserMikroOrmEntity; // Trener
  @Enum(() => CustomerSource)
  source: CustomerSource;
  @Property({ type: 'text' })
  firstName: string;
  @Property({ type: 'text', nullable: true })
  lastName?: string;
  @Property({ type: 'text', nullable: true })
  nickname?: string;
  @Property({ type: 'text', nullable: true })
  email?: string;
  @Property({ type: 'text', nullable: true })
  phoneNumber?: string;
  @Property({ type: 'text', nullable: true })
  avatarUrl?: string;
  @Property({ type: 'text', nullable: true })
  instagramAccountId?: string;
  @Property({ type: 'text', nullable: true })
  whatsappAccountId?: string;
  @Property({ type: 'jsonb', nullable: true })
  equipmentToBring?: string[]; // np. ['Rakieta testowa (klubowa)', 'Owijka', 'Piłki PRO']
  @Property({ type: 'jsonb', nullable: true })
  focusAreas?: string[]; // np. ['Serwis', 'Wybicie z szyby', 'Kondycja']
  @Property({ type: 'text', nullable: true })
  healthNotes?: string; // np. "Ból w prawym łokciu", "Słabe kolano" - KRYTYCZNE!
  @Property({ type: 'text', nullable: true })
  generalNotes?: string; // Dowolne uwagi trenera
  @Enum(() => CustomerStatusEnum)
  status: CustomerStatusEnum;
  @Property({ type: 'boolean', default: false })
  aiOptOut: boolean;
  @Property({ type: 'text', default: 'pl' })
  preferredLanguage: string;
  @Property({ type: 'integer', nullable: true })
  totalSessionsCount?: number;
  @Property({ type: 'integer', nullable: true })
  noShowCount?: number;

  constructor(props: CustomerMikroOrmEntityProps) {
    super();
    this.id = props.id ?? generateUUID();
    this.user = props.user;
    this.source = props.source;
    this.firstName = props.firstName;
    this.lastName = props.lastName;
    this.nickname = props.nickname;
    this.email = props.email;
    this.phoneNumber = props.phoneNumber;
    this.avatarUrl = props.avatarUrl;
    this.instagramAccountId = props.instagramAccountId;
    this.whatsappAccountId = props.whatsappAccountId;
    this.equipmentToBring = props.equipmentToBring;
    this.focusAreas = props.focusAreas;
    this.healthNotes = props.healthNotes;
    this.generalNotes = props.generalNotes;
    this.status = props.status;
    this.aiOptOut = props.aiOptOut ?? false;
    this.preferredLanguage = props.preferredLanguage ?? 'pl';
    this.totalSessionsCount = props.totalSessionsCount;
    this.noShowCount = props.noShowCount;
    if (props.createdAt) this.createdAt = props.createdAt;
    if (props.updatedAt) this.updatedAt = props.updatedAt;
    this.deletedAt = props.deletedAt;
  }
}
