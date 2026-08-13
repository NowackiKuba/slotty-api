export enum IntegrationStatusEnum {
  CONNECTED = 'CONNECTED',
  DISCONNECTED = 'DISCONNECTED',
  EXPIRED = 'EXPIRED',
  ERROR = 'ERROR',
  REVOKED = 'REVOKED',
}

const INTEGRATION_STATUS_VALUES = new Set<string>(
  Object.values(IntegrationStatusEnum),
);

export function isIntegrationStatus(
  value: string,
): value is IntegrationStatusEnum {
  return INTEGRATION_STATUS_VALUES.has(value);
}
