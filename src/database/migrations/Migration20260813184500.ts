import { Migration } from '@mikro-orm/migrations';

export class Migration20260813184500 extends Migration {
  override async up(): Promise<void> {
    this.addSql(
      `create table "user_integrations" ("id" uuid not null default gen_random_uuid(), "created_at" timestamptz not null, "updated_at" timestamptz not null, "deleted_at" varchar(255) null, "user_id" uuid not null, "provider" text check ("provider" in ('GOOGLE_CALENDAR', 'INSTAGRAM_DM', 'WHATSAPP_CLOUD', 'SMS_PROVIDER')) not null, "status" text check ("status" in ('CONNECTED', 'DISCONNECTED', 'EXPIRED', 'ERROR', 'REVOKED')) not null default 'CONNECTED', "external_account_id" text null, "access_token" text null, "refresh_token" text null, "expires_at" timestamptz null, "scopes" jsonb not null default '[]', "settings" jsonb not null default '{}', "last_synced_at" timestamptz null, "error_message" text null, constraint "user_integrations_pkey" primary key ("id"));`,
    );
    this.addSql(
      `alter table "user_integrations" add constraint "user_integrations_user_id_provider_unique" unique ("user_id", "provider");`,
    );
    this.addSql(
      `alter table "user_integrations" add constraint "user_integrations_user_id_foreign" foreign key ("user_id") references "users" ("id") on update cascade;`,
    );
  }

  override async down(): Promise<void> {
    this.addSql(`drop table if exists "user_integrations" cascade;`);
  }
}
