import { apiRequestJsonWithAuth } from '@/lib/api/client';
import { API_ENDPOINTS } from '@/lib/api/endpoints';
import type { LedgerTransactionDto } from '@/lib/types/ledger';

export async function fetchAdminLedger(): Promise<LedgerTransactionDto[]> {
  return apiRequestJsonWithAuth<LedgerTransactionDto[]>(
    API_ENDPOINTS.transactionsAdminList,
    'Failed to load ledger',
  );
}
