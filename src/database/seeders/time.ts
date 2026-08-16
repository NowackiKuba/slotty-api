/**
 * Timezone helpers.
 *
 * Working hours are stored as wall-clock strings ("08:00") while events are
 * stored as absolute timestamps, so the seeder has to resolve one against the
 * trainer's timezone. `date-fns` v4 needs `@date-fns/tz` for that and it is not
 * a dependency, so this does it with `Intl` alone.
 */

/** Offset of `tz` from UTC, in milliseconds, at the given instant. */
function offsetAt(tz: string, instant: Date): number {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: tz,
    hour12: false,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  }).formatToParts(instant);

  const read = (type: string): number =>
    Number(parts.find((part) => part.type === type)?.value ?? '0');

  const asIfUtc = Date.UTC(
    read('year'),
    read('month') - 1,
    read('day'),
    read('hour') % 24,
    read('minute'),
    read('second'),
  );

  return asIfUtc - instant.getTime();
}

/**
 * Wall-clock time in `tz` to an absolute instant. Two passes so a DST boundary
 * between the guess and the real instant still resolves correctly.
 */
export function zonedToUtc(
  tz: string,
  year: number,
  month: number,
  day: number,
  hours: number,
  minutes: number,
): Date {
  const wallClock = Date.UTC(year, month - 1, day, hours, minutes);
  const firstGuess = wallClock - offsetAt(tz, new Date(wallClock));

  return new Date(wallClock - offsetAt(tz, new Date(firstGuess)));
}

/** ISO weekday, 1 = Monday … 7 = Sunday. */
export function isoDayOfWeek(date: Date): number {
  return date.getUTCDay() === 0 ? 7 : date.getUTCDay();
}

/** Iterates calendar days (UTC-anchored) from `from` to `to`, inclusive. */
export function eachDay(from: Date, to: Date): Date[] {
  const days: Date[] = [];
  const cursor = new Date(
    Date.UTC(from.getUTCFullYear(), from.getUTCMonth(), from.getUTCDate()),
  );
  const last = Date.UTC(to.getUTCFullYear(), to.getUTCMonth(), to.getUTCDate());

  while (cursor.getTime() <= last) {
    days.push(new Date(cursor));
    cursor.setUTCDate(cursor.getUTCDate() + 1);
  }

  return days;
}

export function parseHourMinute(value: string): [number, number] {
  const [hours, minutes] = value.split(':').map(Number);
  return [hours, minutes];
}

export function addMinutes(date: Date, minutes: number): Date {
  return new Date(date.getTime() + minutes * 60_000);
}

export function addDays(date: Date, days: number): Date {
  return new Date(date.getTime() + days * 86_400_000);
}
