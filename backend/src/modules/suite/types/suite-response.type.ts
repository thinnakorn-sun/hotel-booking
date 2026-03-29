import type { Suite } from '../../../prisma-client';

export type SuiteResponse = Omit<Suite, 'pricePerNight'> & {
  pricePerNight: number;
};
