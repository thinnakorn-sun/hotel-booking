export const SUITE_CATEGORIES = ['SUITE', 'PENTHOUSE', 'VILLA'] as const;

export type SuiteCategoryValue = (typeof SUITE_CATEGORIES)[number];

export const SUITE_CATEGORY_LABELS: Record<SuiteCategoryValue, string> = {
  SUITE: 'Suite',
  PENTHOUSE: 'Penthouse',
  VILLA: 'Villa',
};

export function isSuiteCategory(value: string): value is SuiteCategoryValue {
  return (SUITE_CATEGORIES as readonly string[]).includes(value);
}

export function getSuiteCategoryLabel(value: string): string {
  return isSuiteCategory(value)
    ? SUITE_CATEGORY_LABELS[value]
    : value;
}
