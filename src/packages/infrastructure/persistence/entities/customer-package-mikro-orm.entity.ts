import { Currency } from '@common/domain/enums';
import { generateUUID } from '@common/uuid';
import { CustomerMikroOrmEntity } from '@customers/infrastructure/persistence/entities';
import { BaseEntity } from '@database/base.entity';
import { Entity, Enum, ManyToOne, Property } from '@mikro-orm/core';
import { UserMikroOrmEntity } from '@users/infrastructure/persistence/entities';
import { PackageTemplateMikroOrmEntity } from './package-template-mikro-orm.entity';
import { CustomerPackageStatusEnum } from '@packages/domain/enums';

export type CustomerPackageMikroOrmEntityProps = {
  id?: string;
  user: UserMikroOrmEntity; // Trener
  customer: CustomerMikroOrmEntity; // Klient
  packageTemplate?: PackageTemplateMikroOrmEntity | null; // Opcjonalny odnośnik do szablonu

  // --- Snapshot danych z momentu zakupu ---
  name: string; // np. "Pakiet 10 Treningów Indywidualnych"
  totalSessions: number; // np. 10
  remainingSessions: number; // np. 10 (maleje z każdym treningiem)
  pricePaid: number; // Grosze (np. 140000 = 1400 PLN)
  currency?: Currency; // PLN

  // --- Statusy i Płatności ---
  isPaid?: boolean; // Czy pakiet został opłacony
  status?: CustomerPackageStatusEnum;
  expiresAt?: Date | null; // Data wygaśnięcia (opcjonalna)

  createdAt?: Date;
  updatedAt?: Date;
  deletedAt?: Date | null;
};

@Entity({ tableName: 'customer_packages' })
export class CustomerPackageMikroOrmEntity
  extends BaseEntity
  implements CustomerPackageMikroOrmEntityProps
{
  @ManyToOne(() => UserMikroOrmEntity)
  user: UserMikroOrmEntity;

  @ManyToOne(() => CustomerMikroOrmEntity)
  customer: CustomerMikroOrmEntity;

  @ManyToOne(() => PackageTemplateMikroOrmEntity, { nullable: true })
  packageTemplate?: PackageTemplateMikroOrmEntity | null;

  @Property({ type: 'text' })
  name: string;

  @Property({ type: 'integer' })
  totalSessions: number;

  @Property({ type: 'integer' })
  remainingSessions: number;

  @Property({ type: 'integer' })
  pricePaid: number;

  @Enum({ items: () => Currency, default: Currency.PLN })
  currency: Currency;

  @Property({ type: 'boolean', default: false })
  isPaid: boolean;

  @Enum({
    items: () => CustomerPackageStatusEnum,
    default: CustomerPackageStatusEnum.ACTIVE,
  })
  status: CustomerPackageStatusEnum;

  @Property({ type: 'datetime', nullable: true })
  expiresAt?: Date | null;

  constructor(props: CustomerPackageMikroOrmEntityProps) {
    super();
    this.id = props.id ?? generateUUID();
    this.user = props.user;
    this.customer = props.customer;
    this.packageTemplate = props.packageTemplate ?? null;
    this.name = props.name;
    this.totalSessions = props.totalSessions;
    this.remainingSessions = props.remainingSessions;
    this.pricePaid = props.pricePaid;
    this.currency = props.currency ?? Currency.PLN;
    this.isPaid = props.isPaid ?? false;
    this.status = props.status ?? CustomerPackageStatusEnum.ACTIVE;
    this.expiresAt = props.expiresAt ?? null;

    if (props.createdAt) this.createdAt = props.createdAt;
    if (props.updatedAt) this.updatedAt = props.updatedAt;
    this.deletedAt = props.deletedAt ?? null;
  }
}
