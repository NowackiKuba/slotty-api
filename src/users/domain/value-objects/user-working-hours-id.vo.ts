import { generateUUID } from '@common/uuid';
import { InvalidUserWorkingHoursIdException } from '@users/domain/exceptions/working-hours';

const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export class UserWorkingHoursId {
  private constructor(private readonly _value: string) {}

  static create(value?: string): UserWorkingHoursId {
    if (value === undefined) {
      return new UserWorkingHoursId(generateUUID());
    }

    if (!UUID_REGEX.test(value)) {
      throw new InvalidUserWorkingHoursIdException(value);
    }

    return new UserWorkingHoursId(value);
  }

  get value(): string {
    return this._value;
  }

  equals(other: UserWorkingHoursId): boolean {
    return this._value === other._value;
  }
}
