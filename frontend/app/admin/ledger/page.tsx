'use client';

import { Download, Search } from 'lucide-react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { fetchAdminLedger } from '@/lib/api/ledger';
import { MotionButton } from '@/components/ui/motion-button';
import type { LedgerTransactionDto } from '@/lib/types/ledger';

function formatMoney(amountStr: string): string {
  const n = Number(amountStr);
  if (Number.isNaN(n)) return amountStr;
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(n);
}

function formatLedgerDate(iso: string): string {
  try {
    return new Date(iso).toLocaleString(undefined, {
      dateStyle: 'medium',
      timeStyle: 'short',
    });
  } catch {
    return iso;
  }
}

function ledgerStatusStyle(status: string): string {
  const u = status.toUpperCase();
  if (u === 'COMPLETED' || u === 'PAID') return 'bg-green-100 text-green-800';
  if (u === 'PENDING') return 'bg-amber-100 text-amber-800';
  return 'bg-surface-container text-on-surface-variant';
}

function ledgerStatusLabel(status: string): string {
  const u = status.toUpperCase();
  if (u === 'COMPLETED') return 'Completed';
  return status;
}

export default function LedgerPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [rows, setRows] = useState<LedgerTransactionDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchAdminLedger();
      setRows(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not load ledger');
      setRows([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const q = searchQuery.toLowerCase();
  const filtered = useMemo(() => {
    if (!q.trim()) return rows;
    return rows.filter(
      (trx) =>
        trx.id.toLowerCase().includes(q) ||
        trx.guestName.toLowerCase().includes(q) ||
        trx.guestEmail.toLowerCase().includes(q) ||
        trx.description.toLowerCase().includes(q) ||
        trx.status.toLowerCase().includes(q) ||
        trx.suiteName.toLowerCase().includes(q) ||
        trx.roomNumber.toLowerCase().includes(q),
    );
  }, [rows, q]);

  const exportCsv = () => {
    const header = [
      'id',
      'transactionDate',
      'guestName',
      'guestEmail',
      'suiteName',
      'roomNumber',
      'description',
      'amount',
      'status',
      'bookingId',
    ];
    const lines = [
      header.join(','),
      ...filtered.map((r) =>
        [
          r.id,
          r.transactionDate,
          `"${r.guestName.replace(/"/g, '""')}"`,
          r.guestEmail,
          `"${r.suiteName.replace(/"/g, '""')}"`,
          r.roomNumber,
          `"${r.description.replace(/"/g, '""')}"`,
          r.amount,
          r.status,
          r.bookingId,
        ].join(','),
      ),
    ];
    const blob = new Blob([lines.join('\n')], {
      type: 'text/csv;charset=utf-8',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ledger-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="font-headline text-2xl font-semibold text-on-surface mb-1">
            Financial Ledger
          </h1>
          <p className="font-body text-sm text-on-surface-variant">
            Transactions from completed booking payments (live data).
          </p>
        </div>
        <div className="flex gap-3 w-full md:w-auto">
          <div className="relative flex-1 md:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-outline" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search transactions..."
              className="w-full pl-9 pr-4 py-2 bg-surface border border-outline-variant/30 rounded-lg font-body text-sm focus:outline-none focus:border-primary transition-colors"
            />
          </div>
          <MotionButton
            type="button"
            variant="secondary"
            size="md"
            onClick={exportCsv}
            disabled={filtered.length === 0}
            className="gap-2"
          >
            <Download className="w-4 h-4" />
            Export
          </MotionButton>
        </div>
      </div>

      {error && (
        <p className="text-sm text-error font-body" role="alert">
          {error}{' '}
          <button
            type="button"
            onClick={load}
            className="underline text-primary"
          >
            Retry
          </button>
        </p>
      )}

      <div className="bg-surface rounded-xl border border-outline-variant/20 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-surface-container-low border-b border-outline-variant/20">
                <th className="p-4 font-label text-xs font-bold uppercase tracking-widest text-on-surface-variant">
                  Transaction ID
                </th>
                <th className="p-4 font-label text-xs font-bold uppercase tracking-widest text-on-surface-variant">
                  Date
                </th>
                <th className="p-4 font-label text-xs font-bold uppercase tracking-widest text-on-surface-variant">
                  Guest
                </th>
                <th className="p-4 font-label text-xs font-bold uppercase tracking-widest text-on-surface-variant">
                  Description
                </th>
                <th className="p-4 font-label text-xs font-bold uppercase tracking-widest text-on-surface-variant text-right">
                  Amount
                </th>
                <th className="p-4 font-label text-xs font-bold uppercase tracking-widest text-on-surface-variant text-right">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="font-body text-sm">
              {loading ? (
                <tr>
                  <td
                    colSpan={6}
                    className="p-8 text-center text-on-surface-variant"
                  >
                    Loading transactions...
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className="p-8 text-center text-on-surface-variant"
                  >
                    {rows.length === 0
                      ? 'No transactions yet. Completed payments appear here.'
                      : `No transactions match "${searchQuery}".`}
                  </td>
                </tr>
              ) : (
                filtered.map((trx) => (
                  <tr
                    key={trx.id}
                    className="border-b border-outline-variant/10 hover:bg-surface-container/50 transition-colors"
                  >
                    <td className="p-4 font-medium text-on-surface font-mono text-xs">
                      {trx.id.slice(0, 8)}...
                    </td>
                    <td className="p-4 text-on-surface-variant whitespace-nowrap">
                      {formatLedgerDate(trx.transactionDate)}
                    </td>
                    <td className="p-4 text-on-surface-variant">
                      <span className="text-on-surface font-medium block">
                        {trx.guestName}
                      </span>
                      <span className="text-xs">{trx.guestEmail}</span>
                    </td>
                    <td className="p-4 text-on-surface-variant">
                      <span className="block">{trx.description}</span>
                      <span className="text-xs text-outline">
                        {trx.suiteName} / {trx.roomNumber}
                      </span>
                    </td>
                    <td className="p-4 text-right font-medium text-on-surface">
                      {formatMoney(trx.amount)}
                    </td>
                    <td className="p-4 text-right">
                      <span
                        className={`inline-block px-2 py-1 text-[10px] font-bold uppercase tracking-widest rounded ${ledgerStatusStyle(trx.status)}`}
                      >
                        {ledgerStatusLabel(trx.status)}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
