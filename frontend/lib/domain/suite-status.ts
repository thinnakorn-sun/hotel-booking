export const SUITE_STATUSES = [
  'AVAILABLE',
  'RESERVED',
  'OCCUPIED',
  'MAINTENANCE',
] as const;

export type SuiteStatusValue = (typeof SUITE_STATUSES)[number];

export const SUITE_MAINTENANCE_STATUS: SuiteStatusValue = SUITE_STATUSES[3];

const STATUS_LABELS: Record<SuiteStatusValue, string> = {
  AVAILABLE: 'Available',
  RESERVED: 'Reserved',
  OCCUPIED: 'Occupied',
  MAINTENANCE: 'Maintenance',
};

const STATUS_BADGE_CLASS: Record<SuiteStatusValue, string> = {
  AVAILABLE: 'bg-green-500',
  RESERVED: 'bg-amber-500',
  OCCUPIED: 'bg-blue-500',
  MAINTENANCE: 'bg-error',
};

const STATUS_BUTTON_ACTIVE: Record<SuiteStatusValue, string> = {
  AVAILABLE: 'bg-green-50 border-green-500 text-green-700',
  RESERVED: 'bg-amber-50 border-amber-500 text-amber-800',
  OCCUPIED: 'bg-blue-50 border-blue-500 text-blue-700',
  MAINTENANCE: 'bg-red-50 border-error text-error',
};

const STATUS_BUTTON_HOVER_BORDER: Record<SuiteStatusValue, string> = {
  AVAILABLE: 'hover:border-green-500',
  RESERVED: 'hover:border-amber-500',
  OCCUPIED: 'hover:border-blue-500',
  MAINTENANCE: 'hover:border-error',
};

const IDLE_BUTTON =
  'bg-surface-container border-outline-variant/30 text-on-surface';

export function isSuiteStatus(value: string): value is SuiteStatusValue {
  return (SUITE_STATUSES as readonly string[]).includes(value);
}

export function getSuiteStatusLabel(status: SuiteStatusValue): string {
  return STATUS_LABELS[status];
}

export function getSuiteStatusBadgeClass(status: string): string {
  if (!isSuiteStatus(status)) {
    return 'bg-outline';
  }
  return STATUS_BADGE_CLASS[status];
}

export function getSuiteStatusManageButtonClass(
  option: SuiteStatusValue,
  current: SuiteStatusValue,
): string {
  const base =
    'p-3 rounded-lg border text-left font-label text-sm font-bold uppercase tracking-widest transition-colors';
  if (option === current) {
    return `${base} ${STATUS_BUTTON_ACTIVE[option]}`;
  }
  return `${base} ${IDLE_BUTTON} ${STATUS_BUTTON_HOVER_BORDER[option]}`;
}

export function isMaintenanceStatus(status: string): boolean {
  return status === SUITE_MAINTENANCE_STATUS;
}
