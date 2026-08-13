import {
  IntegrationStatusEnum,
  isIntegrationStatus,
} from '@users/domain/enums';
import { InvalidIntegrationStatusException } from '@users/domain/exceptions/integration';

export type IntegrationStatusValue =
  (typeof IntegrationStatusEnum)[keyof typeof IntegrationStatusEnum];

export class IntegrationStatus {
  private constructor(private readonly _value: IntegrationStatusValue) {}

  static create(value: string): IntegrationStatus {
    if (!isIntegrationStatus(value)) {
      throw new InvalidIntegrationStatusException(value);
    }

    return new IntegrationStatus(value);
  }

  static connected(): IntegrationStatus {
    return new IntegrationStatus(IntegrationStatusEnum.CONNECTED);
  }

  static disconnected(): IntegrationStatus {
    return new IntegrationStatus(IntegrationStatusEnum.DISCONNECTED);
  }

  static expired(): IntegrationStatus {
    return new IntegrationStatus(IntegrationStatusEnum.EXPIRED);
  }

  static error(): IntegrationStatus {
    return new IntegrationStatus(IntegrationStatusEnum.ERROR);
  }

  static revoked(): IntegrationStatus {
    return new IntegrationStatus(IntegrationStatusEnum.REVOKED);
  }

  get value(): IntegrationStatusValue {
    return this._value;
  }

  get isConnected(): boolean {
    return this._value === IntegrationStatusEnum.CONNECTED;
  }

  get isUsable(): boolean {
    return this._value === IntegrationStatusEnum.CONNECTED;
  }

  equals(other: IntegrationStatus): boolean {
    return this._value === other._value;
  }
}
