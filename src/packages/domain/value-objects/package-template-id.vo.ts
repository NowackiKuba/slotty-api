import { generateUUID } from '@common/uuid';
import { InvalidPackageTemplateIdException } from '@packages/domain/exceptions';

const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export class PackageTemplateId {
  private constructor(private readonly _value: string) {}

  static create(value?: string): PackageTemplateId {
    if (value === undefined) {
      return new PackageTemplateId(generateUUID());
    }

    if (!UUID_REGEX.test(value)) {
      throw new InvalidPackageTemplateIdException(value);
    }

    return new PackageTemplateId(value);
  }

  get value(): string {
    return this._value;
  }

  equals(other: PackageTemplateId): boolean {
    return this._value === other._value;
  }
}
