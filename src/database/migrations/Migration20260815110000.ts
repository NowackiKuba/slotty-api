/* eslint-disable @typescript-eslint/require-await */
import { Migration } from '@mikro-orm/migrations';

export class Migration20260815110000 extends Migration {
  override async up(): Promise<void> {
    this.addSql(
      `create table "messages" ("id" uuid not null default gen_random_uuid(), "created_at" timestamptz not null, "updated_at" timestamptz not null, "deleted_at" varchar(255) null, "user_id" uuid not null, "customer_id" uuid not null, "message_content" text not null, "sender" text check ("sender" in ('CUSTOMER', 'AI_BOT', 'TRAINER')) not null, "external_message_id" text not null, "metadata" jsonb null, "channel" text check ("channel" in ('INSTAGRAM', 'WHATSAPP', 'SMS')) not null, constraint "messages_pkey" primary key ("id"));`,
    );
    this.addSql(
      `create index "messages_user_id_created_at_index" on "messages" ("user_id", "created_at");`,
    );
    this.addSql(
      `create index "messages_user_id_customer_id_created_at_index" on "messages" ("user_id", "customer_id", "created_at");`,
    );
    this.addSql(
      `alter table "messages" add constraint "messages_user_id_channel_external_message_id_unique" unique ("user_id", "channel", "external_message_id");`,
    );

    this.addSql(
      `alter table "messages" add constraint "messages_user_id_foreign" foreign key ("user_id") references "users" ("id") on update cascade;`,
    );
    this.addSql(
      `alter table "messages" add constraint "messages_customer_id_foreign" foreign key ("customer_id") references "customers" ("id") on update cascade;`,
    );
  }

  override async down(): Promise<void> {
    this.addSql(`drop table if exists "messages" cascade;`);
  }
}
