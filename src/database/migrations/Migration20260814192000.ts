import { Migration } from '@mikro-orm/migrations';

export class Migration20260814192000 extends Migration {
  override async up(): Promise<void> {
    this.addSql(
      `alter table "user_profiles" add column "settlement_type" text check ("settlement_type" in ('PER_SESSION', 'WEEKLY_IN_ADVANCE', 'MONTHLY_IN_ADVANCE', 'WEEKLY_IN_ARREARS', 'MONTHLY_IN_ARREARS')) not null default 'PER_SESSION';`,
    );
  }

  override async down(): Promise<void> {
    this.addSql(`alter table "user_profiles" drop column "settlement_type";`);
  }
}
