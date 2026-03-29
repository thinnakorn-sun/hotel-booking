export const SUITE_STATUSES = [
  'AVAILABLE',
  'RESERVED',
  'OCCUPIED',
  'MAINTENANCE',
] as const;

export type SuiteStatus = (typeof SUITE_STATUSES)[number];

export const DEFAULT_SUITE_STATUS: SuiteStatus = SUITE_STATUSES[0];
