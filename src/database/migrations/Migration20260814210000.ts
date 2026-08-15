/* eslint-disable @typescript-eslint/require-await */
import { Migration } from '@mikro-orm/migrations';

export class Migration20260814210000 extends Migration {
  override async up(): Promise<void> {
    this.addSql(
      `create table "events" ("id" uuid not null default gen_random_uuid(), "created_at" timestamptz not null, "updated_at" timestamptz not null, "deleted_at" varchar(255) null, "user_id" uuid not null, "customer_id" uuid null, "status" text check ("status" in ('SCHEDULED', 'CONFIRMED', 'COMPLETED', 'CANCELLED_BY_CUSTOMER', 'CANCELLED_BY_TRAINER', 'NO_SHOW')) not null, "type" text check ("type" in ('INDIVIDUAL_SESSION', 'GROUP_SESSION', 'PERSONAL_BLOCK')) not null, "is_payment_applicable_yet" boolean not null, "price" int not null, "payment_method" text check ("payment_method" in ('BLIK', 'CASH', 'REVOLUT')) null, "currency" text check ("currency" in ('PLN', 'EUR', 'USD')) not null, "location" text null, "source" text check ("source" in ('AI_BOT', 'TRAINER_MANUAL', 'GOOGLE_SYNC')) not null, "is_paid" boolean not null, "title" text not null, "description" text null, "start_date" timestamptz not null, "end_date" timestamptz not null, "google_calendar_id" text null, "google_event_id" text null, "pre_session_plan" text null, "post_session_notes" text null, constraint "events_pkey" primary key ("id"));`,
    );
    this.addSql(
      `create index "events_user_id_start_date_index" on "events" ("user_id", "start_date");`,
    );
    this.addSql(
      `create index "events_customer_id_start_date_index" on "events" ("customer_id", "start_date");`,
    );
    this.addSql(
      `alter table "events" add constraint "events_user_id_google_event_id_unique" unique ("user_id", "google_event_id");`,
    );

    this.addSql(
      `alter table "events" add constraint "events_user_id_foreign" foreign key ("user_id") references "users" ("id") on update cascade;`,
    );
    this.addSql(
      `alter table "events" add constraint "events_customer_id_foreign" foreign key ("customer_id") references "customers" ("id") on update cascade on delete set null;`,
    );
  }

  override async down(): Promise<void> {
    this.addSql(`drop table if exists "events" cascade;`);
  }
}
