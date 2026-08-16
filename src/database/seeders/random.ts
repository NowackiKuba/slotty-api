/**
 * Deterministic PRNG helpers for the dev seeder.
 *
 * Every run with the same `--seed` produces byte-identical data, so a bug you
 * see in the app can be reproduced by re-seeding instead of by guessing.
 */
export class Random {
  private state: number;

  constructor(seed: number) {
    this.state = seed >>> 0;
  }

  /** mulberry32 */
  next(): number {
    this.state = (this.state + 0x6d2b79f5) >>> 0;
    let t = this.state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  }

  /** Inclusive on both ends. */
  int(min: number, max: number): number {
    return min + Math.floor(this.next() * (max - min + 1));
  }

  bool(probability = 0.5): boolean {
    return this.next() < probability;
  }

  pick<T>(items: readonly T[]): T {
    return items[Math.floor(this.next() * items.length)];
  }

  /** Picks `count` distinct items (or all of them, when the pool is smaller). */
  sample<T>(items: readonly T[], count: number): T[] {
    const pool = [...items];
    const taken: T[] = [];
    const n = Math.min(count, pool.length);

    for (let i = 0; i < n; i += 1) {
      const index = Math.floor(this.next() * pool.length);
      taken.push(pool.splice(index, 1)[0]);
    }

    return taken;
  }

  /** Picks by relative weight — `[['a', 3], ['b', 1]]` yields 'a' 75% of the time. */
  weighted<T>(entries: readonly (readonly [T, number])[]): T {
    const total = entries.reduce((sum, [, weight]) => sum + weight, 0);
    let roll = this.next() * total;

    for (const [value, weight] of entries) {
      roll -= weight;
      if (roll <= 0) return value;
    }

    return entries[entries.length - 1][0];
  }
}
