export enum SettlementType {
  PER_SESSION = 'PER_SESSION', // płatność za trening
  WEEKLY_IN_ADVANCE = 'WEEKLY_IN_ADVANCE', // per tydzień z góry
  MONTHLY_IN_ADVANCE = 'MONTHLY_IN_ADVANCE', // per miesiąc z góry
  WEEKLY_IN_ARREARS = 'WEEKLY_IN_ARREARS', // per tydzień z dołu
  MONTHLY_IN_ARREARS = 'MONTHLY_IN_ARREARS', // per miesiąc z dołu
}

const SETTLEMENT_TYPE_VALUES = new Set<string>(Object.values(SettlementType));

export function isSettlementType(value: string): value is SettlementType {
  return SETTLEMENT_TYPE_VALUES.has(value);
}
