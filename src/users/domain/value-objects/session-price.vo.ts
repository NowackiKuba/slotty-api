import { Currency } from '@common/domain/enums';
import { InvalidSessionPriceException } from '@users/domain/exceptions/profile';

const CURRENCY_VALUES = new Set<string>(Object.values(Currency));

export class SessionPrice {
  private constructor(
    private readonly _amountMinor: number,
    private readonly _currency: Currency,
  ) {}

  static create(amountMinor: number, currency: string = Currency.PLN): SessionPrice {
    if (!Number.isInteger(amountMinor) || amountMinor < 0) {
      throw new InvalidSessionPriceException({ amount: amountMinor, currency });
    }

    if (!CURRENCY_VALUES.has(currency)) {
      throw new InvalidSessionPriceException({ amount: amountMinor, currency });
    }

    return new SessionPrice(amountMinor, currency as Currency);
  }

  get amountMinor(): number {
    return this._amountMinor;
  }

  get currency(): Currency {
    return this._currency;
  }

  equals(other: SessionPrice): boolean {
    return (
      this._amountMinor === other._amountMinor &&
      this._currency === other._currency
    );
  }
}
