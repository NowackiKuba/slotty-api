import { generateUUID } from '@common/uuid';
import { InvalidBroadcastIdException } from '@broadcasts/domain/exceptions';

const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export class BroadcastId {
  private constructor(private readonly _value: string) {}

  static create(value?: string): BroadcastId {
    if (value === undefined) {
      return new BroadcastId(generateUUID());
    }

    if (!UUID_REGEX.test(value)) {
      throw new InvalidBroadcastIdException(value);
    }

    return new BroadcastId(value);
  }

  get value(): string {
    return this._value;
  }

  equals(other: BroadcastId): boolean {
    return this._value === other._value;
  }
}
