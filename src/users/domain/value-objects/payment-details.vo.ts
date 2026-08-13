import { InvalidPaymentDetailsException } from '@users/domain/exceptions/profile';

const BLIK_PHONE_REGEX = /^\d{9}$/;

export type BankDetailsProps = {
  account: string;
  recipient: string;
  titleTemplate: string;
};

export type PaymentDetailsProps = {
  blikPhone?: string;
  bank?: BankDetailsProps;
};

export class PaymentDetails {
  private constructor(
    private readonly _blikPhone?: string,
    private readonly _bank?: BankDetailsProps,
  ) {}

  static create(props: PaymentDetailsProps): PaymentDetails {
    const blikPhone = props.blikPhone?.replace(/\s+/g, '') || undefined;

    if (blikPhone && !BLIK_PHONE_REGEX.test(blikPhone)) {
      throw new InvalidPaymentDetailsException(
        'blik phone must be a 9-digit number',
      );
    }

    let bank: BankDetailsProps | undefined;

    if (props.bank) {
      const account = props.bank.account.trim();
      const recipient = props.bank.recipient.trim();
      const titleTemplate = props.bank.titleTemplate.trim();

      if (!account || !recipient || !titleTemplate) {
        throw new InvalidPaymentDetailsException(
          'bank account, recipient and title template are required',
        );
      }

      bank = { account, recipient, titleTemplate };
    }

    return new PaymentDetails(blikPhone, bank);
  }

  get blikPhone(): string | undefined {
    return this._blikPhone;
  }

  get bank(): BankDetailsProps | undefined {
    return this._bank;
  }

  equals(other: PaymentDetails): boolean {
    return JSON.stringify(this.toProps()) === JSON.stringify(other.toProps());
  }

  toProps(): PaymentDetailsProps {
    return {
      blikPhone: this._blikPhone,
      bank: this._bank,
    };
  }
}
