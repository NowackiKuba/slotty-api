/* eslint-disable @typescript-eslint/require-await */
import { Migration } from '@mikro-orm/migrations';

export class Migration20260815140000 extends Migration {
  override async up(): Promise<void> {
    this.addSql(
      `create table "package_templates" ("id" uuid not null default gen_random_uuid(), "created_at" timestamptz not null, "updated_at" timestamptz not null, "deleted_at" varchar(255) null, "user_id" uuid not null, "name" text not null, "description" text null, "session_count" int not null, "price" int not null, "currency" text check ("currency" in ('PLN', 'EUR', 'USD')) not null default 'PLN', "validity_days" int null, "is_active" boolean not null default true, constraint "package_templates_pkey" primary key ("id"));`,
    );
    this.addSql(
      `create index "package_templates_user_id_index" on "package_templates" ("user_id");`,
    );
    this.addSql(
      `alter table "package_templates" add constraint "package_templates_user_id_foreign" foreign key ("user_id") references "users" ("id") on update cascade;`,
    );

    this.addSql(
      `create table "customer_packages" ("id" uuid not null default gen_random_uuid(), "created_at" timestamptz not null, "updated_at" timestamptz not null, "deleted_at" varchar(255) null, "user_id" uuid not null, "customer_id" uuid not null, "package_template_id" uuid null, "name" text not null, "total_sessions" int not null, "remaining_sessions" int not null, "price_paid" int not null, "currency" text check ("currency" in ('PLN', 'EUR', 'USD')) not null default 'PLN', "is_paid" boolean not null default false, "status" text check ("status" in ('ACTIVE', 'EXPIRED', 'DEPLETED', 'CANCELLED')) not null default 'ACTIVE', "expires_at" timestamptz null, constraint "customer_packages_pkey" primary key ("id"));`,
    );
    this.addSql(
      `create index "customer_packages_user_id_created_at_index" on "customer_packages" ("user_id", "created_at");`,
    );
    this.addSql(
      `create index "customer_packages_user_id_customer_id_index" on "customer_packages" ("user_id", "customer_id");`,
    );
    this.addSql(
      `alter table "customer_packages" add constraint "customer_packages_user_id_foreign" foreign key ("user_id") references "users" ("id") on update cascade;`,
    );
    this.addSql(
      `alter table "customer_packages" add constraint "customer_packages_customer_id_foreign" foreign key ("customer_id") references "customers" ("id") on update cascade;`,
    );
    this.addSql(
      `alter table "customer_packages" add constraint "customer_packages_package_template_id_foreign" foreign key ("package_template_id") references "package_templates" ("id") on update cascade on delete set null;`,
    );
  }

  override async down(): Promise<void> {
    this.addSql(`drop table if exists "customer_packages" cascade;`);
    this.addSql(`drop table if exists "package_templates" cascade;`);
  }
}
