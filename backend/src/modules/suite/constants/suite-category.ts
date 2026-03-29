export const SUITE_CATEGORIES = ['SUITE', 'PENTHOUSE', 'VILLA'] as const;

export type SuiteCategory = (typeof SUITE_CATEGORIES)[number];

export const DEFAULT_SUITE_CATEGORY: SuiteCategory = SUITE_CATEGORIES[0];
