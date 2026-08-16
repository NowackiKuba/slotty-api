/* eslint-disable @typescript-eslint/require-await */
import { Migration } from '@mikro-orm/migrations';

/**
 * Payment methods become BLIK / BANK_TRANSFER / CASH — REVOLUT is dropped.
 *
 * Existing REVOLUT data is remapped to BANK_TRANSFER rather than nulled, in
 * both places the value is stored: the `events.payment_method` enum column and
 * the `user_profiles.payment_methods` jsonb array.
 */
export class Migration20260816120000 extends Migration {
  override async up(): Promise<void> {
    this.addSql(
      `alter table "events" drop constraint if exists "events_payment_method_check";`,
    );
    this.addSql(
      `update "events" set "payment_method" = 'BANK_TRANSFER' where "payment_method" = 'REVOLUT';`,
    );
    this.addSql(
      `alter table "events" add constraint "events_payment_method_check" check ("payment_method" in ('BLIK', 'BANK_TRANSFER', 'CASH'));`,
    );

    /**
     * The jsonb array keeps its order — its first element is the default the AI
     * booking tool picks — so the rewrite groups by the remapped value and
     * re-aggregates on the earliest ordinality, which also collapses the
     * duplicate a profile holding both REVOLUT and BANK_TRANSFER would get.
     */
    this.addSql(
      `update "user_profiles" p
         set "payment_methods" = sub.methods
       from (
         select p2."id" as id, jsonb_agg(v.method order by v.first_position) as methods
         from "user_profiles" p2,
         lateral (
           select case when e.value = 'REVOLUT' then 'BANK_TRANSFER' else e.value end as method,
                  min(e.position) as first_position
           from jsonb_array_elements_text(p2."payment_methods") with ordinality as e(value, position)
           group by 1
         ) v
         where p2."payment_methods" @> '["REVOLUT"]'::jsonb
         group by p2."id"
       ) sub
       where p."id" = sub.id;`,
    );
  }

  override async down(): Promise<void> {
    // Lossy by construction: REVOLUT is the only target left, so profiles and
    // events that always meant BANK_TRANSFER come back as REVOLUT.
    this.addSql(
      `alter table "events" drop constraint if exists "events_payment_method_check";`,
    );
    this.addSql(
      `update "events" set "payment_method" = 'REVOLUT' where "payment_method" = 'BANK_TRANSFER';`,
    );
    this.addSql(
      `alter table "events" add constraint "events_payment_method_check" check ("payment_method" in ('BLIK', 'CASH', 'REVOLUT'));`,
    );

    this.addSql(
      `update "user_profiles" p
         set "payment_methods" = sub.methods
       from (
         select p2."id" as id, jsonb_agg(v.method order by v.first_position) as methods
         from "user_profiles" p2,
         lateral (
           select case when e.value = 'BANK_TRANSFER' then 'REVOLUT' else e.value end as method,
                  min(e.position) as first_position
           from jsonb_array_elements_text(p2."payment_methods") with ordinality as e(value, position)
           group by 1
         ) v
         where p2."payment_methods" @> '["BANK_TRANSFER"]'::jsonb
         group by p2."id"
       ) sub
       where p."id" = sub.id;`,
    );
  }
}
