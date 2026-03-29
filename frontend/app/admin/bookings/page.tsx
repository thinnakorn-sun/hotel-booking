'use client';

import { useCallback, useEffect, useState } from 'react';
import { fetchAdminBookings } from '@/lib/api/bookings';
import { MotionButton } from '@/components/ui/motion-button';
import type { BookingDto } from '@/lib/types/booking';

export default function AdminBookingsPage() {
  const [rows, setRows] = useState<BookingDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchAdminBookings();
      setRows(data);
    } catch (e) {
      setRows([]);
      setError(e instanceof Error ? e.message : 'Failed to load');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="font-headline text-2xl font-semibold text-on-surface mb-1">
            Bookings & payments
          </h1>
          <p className="font-body text-sm text-on-surface-variant">
            Live data from the API and database (all guests).
          </p>
        </div>
        <MotionButton
          type="button"
          variant="primary"
          size="md"
          onClick={() => void load()}
          disabled={loading}
          className="self-start px-6"
        >
          {loading ? 'Refreshing…' : 'Refresh'}
        </MotionButton>
      </div>

      {error && (
        <p className="text-error font-body text-sm">{error}</p>
      )}

      {loading && rows.length === 0 ? (
        <p className="font-body text-on-surface-variant">Loading…</p>
      ) : rows.length === 0 ? (
        <p className="font-body text-on-surface-variant">No bookings yet.</p>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-outline-variant/20 bg-surface shadow-sm">
          <table className="w-full text-left text-sm font-body">
            <thead className="bg-surface-container-low font-label text-[10px] uppercase tracking-widest text-on-surface-variant">
              <tr>
                <th className="px-4 py-3">Guest</th>
                <th className="px-4 py-3">Suite</th>
                <th className="px-4 py-3">Stay</th>
                <th className="px-4 py-3 text-right">Amount</th>
                <th className="px-4 py-3">Booking</th>
                <th className="px-4 py-3">Payment</th>
                <th className="px-4 py-3">Method</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((b) => (
                <tr
                  key={b.id}
                  className="border-t border-outline-variant/15 text-on-surface"
                >
                  <td className="px-4 py-3">
                    <div className="font-medium">
                      {b.guest.firstName} {b.guest.lastName}
                    </div>
                    <div className="text-xs text-on-surface-variant">
                      {b.guest.email}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div>{b.suite.name}</div>
                    <div className="text-xs text-primary">{b.suite.roomNumber}</div>
                  </td>
                  <td className="px-4 py-3 text-on-surface-variant whitespace-nowrap">
                    {new Date(b.checkInDate).toLocaleDateString()} —{' '}
                    {new Date(b.checkOutDate).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3 text-right font-headline">
                    ${b.totalAmount.toFixed(2)}
                  </td>
                  <td className="px-4 py-3 font-label text-xs uppercase">
                    {b.status}
                  </td>
                  <td className="px-4 py-3 font-label text-xs uppercase">
                    {b.paymentStatus ?? '—'}
                  </td>
                  <td className="px-4 py-3 text-xs text-on-surface-variant max-w-[140px] truncate" title={b.paymentMethod ?? ''}>
                    {b.paymentMethod
                      ? b.paymentMethod.replace(/_/g, ' ')
                      : '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
