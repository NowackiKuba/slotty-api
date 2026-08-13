/**
 * Calendar arithmetic on local date keys (`YYYY-MM-DD`). The keys are already
 * resolved in the user's timezone, so every helper here anchors at UTC midnight
 * and only ever moves whole days — no DST shifts can leak in.
 */

const MS_PER_DAY = 24 * 60 * 60 * 1000;

export function parseLocalDateKey(dateKey: string): Date {
  return new Date(`${dateKey}T00:00:00.000Z`);
}

export function formatLocalDateKey(date: Date): string {
  return date.toISOString().slice(0, 10);
}

export function addLocalDays(dateKey: string, days: number): string {
  return formatLocalDateKey(
    new Date(parseLocalDateKey(dateKey).getTime() + days * MS_PER_DAY),
  );
}

/** ISO weekday: 1 = Monday … 7 = Sunday. */
export function isoWeekday(dateKey: string): number {
  const day = parseLocalDateKey(dateKey).getUTCDay();
  return day === 0 ? 7 : day;
}

/** Monday of the week `dateKey` falls in. */
export function startOfIsoWeek(dateKey: string): string {
  return addLocalDays(dateKey, -(isoWeekday(dateKey) - 1));
}

export function weeksAgoLabel(weeksAgo: number): string {
  if (weeksAgo === 0) return 'This week';
  if (weeksAgo === 1) return 'Last week';
  return `${weeksAgo} weeks ago`;
}
