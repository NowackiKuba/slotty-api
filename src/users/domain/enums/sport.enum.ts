export enum Sport {
  TENNIS = 'tennis',
  PADEL = 'padel',
  SQUASH = 'squash',
  PICKLEBALL = 'pickleball',
  PINGPONG = 'pingpong',
}

const SPORT_VALUES = new Set<string>(Object.values(Sport));

export function isSport(value: string): value is Sport {
  return SPORT_VALUES.has(value);
}
