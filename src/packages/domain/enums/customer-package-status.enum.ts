export enum CustomerPackageStatusEnum {
  ACTIVE = 'ACTIVE',
  EXPIRED = 'EXPIRED',
  DEPLETED = 'DEPLETED',
  CANCELLED = 'CANCELLED',
}

const CUSTOMER_PACKAGE_STATUS_VALUES = new Set<string>(
  Object.values(CustomerPackageStatusEnum),
);

export function isCustomerPackageStatus(
  value: string,
): value is CustomerPackageStatusEnum {
  return CUSTOMER_PACKAGE_STATUS_VALUES.has(value);
}
