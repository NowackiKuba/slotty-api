import { generateUUID } from '@common/uuid';
import { InvalidBroadcastRecipientIdException } from '@broadcasts/domain/exceptions';

const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export class BroadcastRecipientId {
  private constructor(private readonly _value: string) {}

  static create(value?: string): BroadcastRecipientId {
    if (value === undefined) {
      return new BroadcastRecipientId(generateUUID());
    }

    if (!UUID_REGEX.test(value)) {
      throw new InvalidBroadcastRecipientIdException(value);
    }

    return new BroadcastRecipientId(value);
  }

  get value(): string {
    return this._value;
  }

  equals(other: BroadcastRecipientId): boolean {
    return this._value === other._value;
  }
}
