export enum CustomerSource {
  MANUAL = 'manual',
  IG = 'ig',
  WHATSAPP = 'whatsapp',
  MOBILE = 'mobile',
  WEB = 'web',
}

const CUSTOMER_SOURCE_VALUES = new Set<string>(Object.values(CustomerSource));

export function isCustomerSource(value: string): value is CustomerSource {
  return CUSTOMER_SOURCE_VALUES.has(value);
}
