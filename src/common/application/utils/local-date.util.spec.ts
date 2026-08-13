import {
  addLocalDays,
  isoWeekday,
  startOfIsoWeek,
  weeksAgoLabel,
} from './local-date.util';

describe('local date helpers', () => {
  it('numbers weekdays Monday-first', () => {
    expect(isoWeekday('2026-07-27')).toBe(1);
    expect(isoWeekday('2026-08-02')).toBe(7);
  });

  it('walks days across month boundaries', () => {
    expect(addLocalDays('2026-07-31', 1)).toBe('2026-08-01');
    expect(addLocalDays('2026-08-01', -1)).toBe('2026-07-31');
    expect(addLocalDays('2026-07-27', -21)).toBe('2026-07-06');
  });

  it('snaps to the Monday of the week', () => {
    expect(startOfIsoWeek('2026-08-02')).toBe('2026-07-27');
    expect(startOfIsoWeek('2026-07-27')).toBe('2026-07-27');
  });

  it('crosses a DST boundary without drifting', () => {
    // Europe/Warsaw springs forward on 2026-03-29.
    expect(addLocalDays('2026-03-28', 2)).toBe('2026-03-30');
    expect(startOfIsoWeek('2026-03-29')).toBe('2026-03-23');
  });

  it('labels weeks relative to now', () => {
    expect(weeksAgoLabel(0)).toBe('This week');
    expect(weeksAgoLabel(1)).toBe('Last week');
    expect(weeksAgoLabel(3)).toBe('3 weeks ago');
  });
});
