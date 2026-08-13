import { Migration } from '@mikro-orm/migrations';

export class Migration20260813163420 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`create table "customers" ("id" uuid not null default gen_random_uuid(), "created_at" timestamptz not null, "updated_at" timestamptz not null, "deleted_at" varchar(255) null, "user_id" uuid not null, "source" text check ("source" in ('manual', 'ig', 'whatsapp', 'mobile', 'web')) not null, "first_name" text not null, "last_name" text null, "nickname" text null, "email" text null, "phone_number" text null, "avatar_url" text null, "instagram_account_id" text null, "whatsapp_account_id" text null, "equipment_to_bring" jsonb null, "focus_areas" jsonb null, "health_notes" text null, "general_notes" text null, "status" text check ("status" in ('guest', 'active', 'inactive', 'blocked')) not null, "ai_opt_out" boolean not null default false, "preferred_language" text not null default 'pl', "total_sessions_count" int null, "no_show_count" int null, constraint "customers_pkey" primary key ("id"));`);
    this.addSql(`alter table "customers" add constraint "customers_user_id_email_unique" unique ("user_id", "email");`);
    this.addSql(`alter table "customers" add constraint "customers_user_id_phone_number_unique" unique ("user_id", "phone_number");`);
    this.addSql(`alter table "customers" add constraint "customers_user_id_whatsapp_account_id_unique" unique ("user_id", "whatsapp_account_id");`);
    this.addSql(`alter table "customers" add constraint "customers_user_id_instagram_account_id_unique" unique ("user_id", "instagram_account_id");`);

    this.addSql(`alter table "customers" add constraint "customers_user_id_foreign" foreign key ("user_id") references "users" ("id") on update cascade;`);
  }

  override async down(): Promise<void> {
    this.addSql(`drop table if exists "customers" cascade;`);
  }

}
