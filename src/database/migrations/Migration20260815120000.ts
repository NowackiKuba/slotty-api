/* eslint-disable @typescript-eslint/require-await */
import { Migration } from '@mikro-orm/migrations';

export class Migration20260815120000 extends Migration {
  override async up(): Promise<void> {
    this.addSql(
      `create table "user_working_hours" ("id" uuid not null default gen_random_uuid(), "created_at" timestamptz not null, "updated_at" timestamptz not null, "deleted_at" varchar(255) null, "user_id" uuid not null, "day_of_week" int not null, "start_time" text not null, "end_time" text not null, "is_day_off" boolean not null, constraint "user_working_hours_pkey" primary key ("id"), constraint "user_working_hours_day_of_week_check" check ("day_of_week" between 1 and 7));`,
    );
    this.addSql(
      `create index "user_working_hours_user_id_index" on "user_working_hours" ("user_id");`,
    );
    this.addSql(
      `alter table "user_working_hours" add constraint "user_working_hours_user_id_day_of_week_unique" unique ("user_id", "day_of_week");`,
    );
    this.addSql(
      `alter table "user_working_hours" add constraint "user_working_hours_user_id_foreign" foreign key ("user_id") references "users" ("id") on update cascade;`,
    );
  }

  override async down(): Promise<void> {
    this.addSql(`drop table if exists "user_working_hours" cascade;`);
  }
}
