import {
  addLocalDays,
  isoWeekday,
} from '@common/application/utils/local-date.util';

const DATE_KEY_REGEX = /^\d{4}-\d{2}-\d{2}$/;
const TIME_REGEX = /^([01]\d|2[0-3]):[0-5]\d$/;

export function formatDateKeyInTimeZone(date: Date, timeZone: string): string {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(date);
  const get = (type: string) =>
    parts.find((part) => part.type === type)?.value ?? '';

  return `${get('year')}-${get('month')}-${get('day')}`;
}

export function assertDateKey(value: string, field: string): string {
  if (!DATE_KEY_REGEX.test(value)) {
    throw new Error(`${field} must be a YYYY-MM-DD date`);
  }

  return value;
}

export function eachDateKey(from: string, to: string): string[] {
  const keys: string[] = [];
  let current = from;

  while (current <= to) {
    keys.push(current);
    current = addLocalDays(current, 1);
  }

  return keys;
}

export function weekdayOfDateKey(dateKey: string): number {
  return isoWeekday(dateKey);
}

export function zonedLocalToUtc(
  dateKey: string,
  time: string,
  timeZone: string,
): Date {
  if (!TIME_REGEX.test(time)) {
    throw new Error(`Invalid time: ${time}`);
  }

  const asIfUtc = new Date(`${dateKey}T${time}:00.000Z`);
  const offset1 = getTimeZoneOffsetMs(asIfUtc, timeZone);
  const adjusted = new Date(asIfUtc.getTime() - offset1);
  const offset2 = getTimeZoneOffsetMs(adjusted, timeZone);

  if (offset2 !== offset1) {
    return new Date(asIfUtc.getTime() - offset2);
  }

  return adjusted;
}

export function parseDateTimeInTimeZone(value: string, timeZone: string): Date {
  if (/Z|[+-]\d{2}:\d{2}$/.test(value)) {
    const parsed = new Date(value);

    if (Number.isNaN(parsed.getTime())) {
      throw new Error('Invalid startDate');
    }

    return parsed;
  }

  const match = value.match(/^(\d{4}-\d{2}-\d{2})[T ](\d{2}:\d{2})/);

  if (!match) {
    throw new Error('startDate must be an ISO-8601 datetime');
  }

  return zonedLocalToUtc(match[1], match[2], timeZone);
}

function getTimeZoneOffsetMs(instant: Date, timeZone: string): number {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
    hourCycle: 'h23',
  }).formatToParts(instant);

  const map = Object.fromEntries(
    parts
      .filter((part) => part.type !== 'literal')
      .map((part) => [part.type, part.value]),
  );

  let hour = Number(map.hour);

  if (hour === 24) {
    hour = 0;
  }

  const asUtc = Date.UTC(
    Number(map.year),
    Number(map.month) - 1,
    Number(map.day),
    hour,
    Number(map.minute),
    Number(map.second),
  );

  return asUtc - instant.getTime();
}
