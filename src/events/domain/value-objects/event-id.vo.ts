import { generateUUID } from '@common/uuid';
import { InvalidEventIdException } from '@events/domain/exceptions';

const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export class EventId {
  private constructor(private readonly _value: string) {}

  static create(value?: string): EventId {
    if (value === undefined) {
      return new EventId(generateUUID());
    }

    if (!UUID_REGEX.test(value)) {
      throw new InvalidEventIdException(value);
    }

    return new EventId(value);
  }

  get value(): string {
    return this._value;
  }

  equals(other: EventId): boolean {
    return this._value === other._value;
  }
}
