import { InvalidSessionDurationException } from '@users/domain/exceptions/profile';

const MIN_MINUTES = 15;
const MAX_MINUTES = 480;

export class SessionDuration {
  private constructor(private readonly _minutes: number) {}

  static create(minutes: number): SessionDuration {
    if (
      !Number.isInteger(minutes) ||
      minutes < MIN_MINUTES ||
      minutes > MAX_MINUTES
    ) {
      throw new InvalidSessionDurationException(minutes);
    }

    return new SessionDuration(minutes);
  }

  get minutes(): number {
    return this._minutes;
  }

  equals(other: SessionDuration): boolean {
    return this._minutes === other._minutes;
  }
}
