/* eslint-disable @typescript-eslint/require-await */
import { Migration } from '@mikro-orm/migrations';

export class Migration20260815130000 extends Migration {
  override async up(): Promise<void> {
    this.addSql(
      `create table "broadcasts" ("id" uuid not null default gen_random_uuid(), "created_at" timestamptz not null, "updated_at" timestamptz not null, "deleted_at" varchar(255) null, "user_id" uuid not null, "message_text" text not null, "target_channel" text check ("target_channel" in ('INSTAGRAM', 'WHATSAPP', 'SMS')) not null, "status" text check ("status" in ('DRAFT', 'SENDING', 'COMPLETED', 'FAILED')) not null, "scheduled_at" timestamptz not null, "sent_count" int not null, constraint "broadcasts_pkey" primary key ("id"));`,
    );
    this.addSql(
      `create index "broadcasts_user_id_scheduled_at_index" on "broadcasts" ("user_id", "scheduled_at");`,
    );
    this.addSql(
      `alter table "broadcasts" add constraint "broadcasts_user_id_foreign" foreign key ("user_id") references "users" ("id") on update cascade;`,
    );

    this.addSql(
      `create table "broadcast_recipients" ("id" uuid not null default gen_random_uuid(), "created_at" timestamptz not null, "updated_at" timestamptz not null, "deleted_at" varchar(255) null, "broadcast_id" uuid not null, "customer_id" uuid not null, "status" text check ("status" in ('PENDING', 'PROCESSING', 'SENT', 'DELIVERED', 'FAILED')) not null, "message_id" uuid null, "sent_at" timestamptz null, "error_message" text null, constraint "broadcast_recipients_pkey" primary key ("id"));`,
    );
    this.addSql(
      `alter table "broadcast_recipients" add constraint "broadcast_recipients_broadcast_id_customer_id_unique" unique ("broadcast_id", "customer_id");`,
    );
    this.addSql(
      `alter table "broadcast_recipients" add constraint "broadcast_recipients_broadcast_id_foreign" foreign key ("broadcast_id") references "broadcasts" ("id") on update cascade;`,
    );
    this.addSql(
      `alter table "broadcast_recipients" add constraint "broadcast_recipients_customer_id_foreign" foreign key ("customer_id") references "customers" ("id") on update cascade;`,
    );
    this.addSql(
      `alter table "broadcast_recipients" add constraint "broadcast_recipients_message_id_foreign" foreign key ("message_id") references "messages" ("id") on update cascade on delete set null;`,
    );
  }

  override async down(): Promise<void> {
    this.addSql(`drop table if exists "broadcast_recipients" cascade;`);
    this.addSql(`drop table if exists "broadcasts" cascade;`);
  }
}
