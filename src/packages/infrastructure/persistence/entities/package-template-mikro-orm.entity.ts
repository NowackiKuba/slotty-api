import { Currency } from '@common/domain/enums';
import { generateUUID } from '@common/uuid';
import { BaseEntity } from '@database/base.entity';
import { Entity, Enum, ManyToOne, Property } from '@mikro-orm/core';
import { UserMikroOrmEntity } from '@users/infrastructure/persistence/entities';

export type PackageTemplateMikroOrmEntityProps = {
  id?: string;
  user: UserMikroOrmEntity; // Trener (właściciel oferty)
  name: string; // np. "Pakiet 10 Treningów Indywidualnych"
  description?: string; // np. "W cenie wliczony wynajem kortu i piłki"
  sessionCount: number; // np. 10
  price: number; // Grosze (np. 140000 = 1400 PLN)
  currency?: Currency; // PLN
  validityDays?: number; // np. 90 (ważność 3 miesiące od zakupu)
  isActive?: boolean; // Czy pakiet jest widoczny w ofercie
  createdAt?: Date;
  updatedAt?: Date;
  deletedAt?: Date | null;
};

@Entity({ tableName: 'package_templates' })
export class PackageTemplateMikroOrmEntity
  extends BaseEntity
  implements PackageTemplateMikroOrmEntityProps
{
  @ManyToOne(() => UserMikroOrmEntity)
  user: UserMikroOrmEntity; // Trener (właściciel oferty)
  @Property({ type: 'text' })
  name: string; // np. "Pakiet 10 Treningów Indywidualnych"
  @Property({ type: 'text', nullable: true })
  description?: string; // np. "W cenie wliczony wynajem kortu i piłki"
  @Property({ type: 'integer' })
  sessionCount: number; // np. 10
  @Property({ type: 'integer' })
  price: number; // Grosze (np. 140000 = 1400 PLN)
  @Enum({
    items: () => Currency,
    default: Currency.PLN,
  })
  currency: Currency; // PLN
  @Property({ type: 'integer', nullable: true })
  validityDays?: number; // np. 90 (ważność 3 miesiące od zakupu)
  @Property({ type: 'boolean', default: true })
  isActive: boolean; // Czy pakiet jest widoczny w ofercie

  constructor(props: PackageTemplateMikroOrmEntityProps) {
    super();
    this.id = props.id ?? generateUUID();
    this.user = props.user;
    this.name = props.name;
    this.description = props.description;
    this.sessionCount = props.sessionCount;
    this.price = props.price;
    this.currency = props.currency ?? Currency.PLN;
    this.validityDays = props.validityDays;
    this.isActive = props.isActive ?? true;
    if (props.createdAt) this.createdAt = props.createdAt;
    if (props.updatedAt) this.updatedAt = props.updatedAt;
    this.deletedAt = props.deletedAt ?? null;
  }
}
