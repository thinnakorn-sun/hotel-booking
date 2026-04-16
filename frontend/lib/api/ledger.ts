import { apiRequestJsonWithAuth } from "@/lib/api/client";
import { API_ENDPOINTS } from "@/lib/api/endpoints";
import { mockLedger } from "@/lib/demo/mock-data";
import type { LedgerTransactionDto } from "@/lib/types/ledger";

export async function fetchAdminLedger(): Promise<LedgerTransactionDto[]> {
  try {
    const data = await apiRequestJsonWithAuth<LedgerTransactionDto[]>(
      API_ENDPOINTS.transactionsAdminList,
      "Failed to load ledger",
    );
    if (data.length > 0) return data;
  } catch {
    // fallback
  }
  return mockLedger;
}
