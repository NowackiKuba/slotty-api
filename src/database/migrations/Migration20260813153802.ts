import { Migration } from '@mikro-orm/migrations';

export class Migration20260813153802 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`create table "auth_identities" ("id" uuid not null default gen_random_uuid(), "created_at" timestamptz not null, "updated_at" timestamptz not null, "deleted_at" varchar(255) null, "user_id" uuid not null, "provider" text not null, "provider_user_id" text not null, "email" text null, constraint "auth_identities_pkey" primary key ("id"));`);
    this.addSql(`create index "auth_identities_user_id_index" on "auth_identities" ("user_id");`);
    this.addSql(`alter table "auth_identities" add constraint "auth_identities_provider_provider_user_id_unique" unique ("provider", "provider_user_id");`);

    this.addSql(`create table "users" ("id" uuid not null default gen_random_uuid(), "created_at" timestamptz not null, "updated_at" timestamptz not null, "deleted_at" varchar(255) null, "first_name" text not null, "last_name" text not null, "display_name" text not null, "email" text not null, "avatar_url" text not null, "email_verified" boolean not null default false, "status" text not null default 'active', "subscription_status" text not null default 'free', "timezone" text not null default 'UTC', "last_login_at" timestamptz null, constraint "users_pkey" primary key ("id"));`);
    this.addSql(`alter table "users" add constraint "users_display_name_unique" unique ("display_name");`);
    this.addSql(`alter table "users" add constraint "users_email_unique" unique ("email");`);

    this.addSql(`create table "user_profiles" ("id" uuid not null default gen_random_uuid(), "created_at" timestamptz not null, "updated_at" timestamptz not null, "deleted_at" varchar(255) null, "user_id" uuid not null, "sports" jsonb not null, "nickname" text null, "bio" text null, "avatar_url" text null, "places" jsonb not null, "with_travel" boolean not null default false, "price_per_session" int not null, "currency" text check ("currency" in ('PLN', 'EUR', 'USD')) not null default 'PLN', "session_duration_minutes" int not null, "court_fee_included" boolean not null default false, "max_group_size" int null, "cancellation_window_hours" int null, "payment_methods" jsonb null, "payment_details" jsonb null, "ai_enabled" boolean null, "auto_confirm_bookings" boolean not null default false, "ai_custom_instructions" jsonb null, "google_calendar_id" text null, constraint "user_profiles_pkey" primary key ("id"));`);
    this.addSql(`alter table "user_profiles" add constraint "user_profiles_user_id_unique" unique ("user_id");`);

    this.addSql(`alter table "user_profiles" add constraint "user_profiles_user_id_foreign" foreign key ("user_id") references "users" ("id") on update cascade;`);
  }

  override async down(): Promise<void> {
    this.addSql(`alter table "user_profiles" drop constraint "user_profiles_user_id_foreign";`);

    this.addSql(`drop table if exists "auth_identities" cascade;`);

    this.addSql(`drop table if exists "users" cascade;`);

    this.addSql(`drop table if exists "user_profiles" cascade;`);
  }

}
