export enum PaymentMethod {
  BLIK = 'BLIK',
  BANK_TRANSFER = 'BANK_TRANSFER',
  CASH = 'CASH',
}

const PAYMENT_METHOD_VALUES = new Set<string>(Object.values(PaymentMethod));

export function isPaymentMethod(value: string): value is PaymentMethod {
  return PAYMENT_METHOD_VALUES.has(value);
}
