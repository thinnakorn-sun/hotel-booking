'use client';

import Link from 'next/link';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useAppDialog } from '@/components/providers/app-dialog-provider';
import { MotionButton } from '@/components/ui/motion-button';
import { fetchAdminArrivals, fetchAdminDashboard } from '@/lib/api/admin';
import { adminCheckInBooking } from '@/lib/api/bookings';
import type {
  AdminDashboardArrival,
  AdminDashboardDto,
  AdminDashboardPendingBooking,
} from '@/lib/types/dashboard';

function formatMoney(n: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(n);
}

function formatDelta(pct: number | null): { text: string; className: string } {
  if (pct == null) {
    return { text: '—', className: 'text-on-surface-variant' };
  }
  const sign = pct >= 0 ? '+' : '';
  return {
    text: `${sign}${pct}%`,
    className: pct >= 0 ? 'text-green-600' : 'text-error',
  };
}

function todayIsoUtc(): string {
  const n = new Date();
  return n.toISOString().slice(0, 10);
}

function addDaysIso(iso: string, delta: number): string {
  const [y, m, d] = iso.split('-').map(Number);
  const nd = new Date(Date.UTC(y, m - 1, d + delta));
  return nd.toISOString().slice(0, 10);
}

function arrivalTimeLabel(iso: string): string {
  try {
    return new Date(iso).toLocaleTimeString(undefined, {
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return '—';
  }
}

function arrivalRowStatus(a: AdminDashboardArrival): string {
  if (a.checkedInAt) return 'Checked in';
  if (a.status === 'CONFIRMED' && a.paymentStatus === 'PAID') return 'Expected';
  if (a.paymentStatus === 'UNPAID') return 'Payment pending';
  return a.status;
}

export default function AdminOverviewPage() {
  const { alert, confirm: confirmDialog } = useAppDialog();
  const [dash, setDash] = useState<AdminDashboardDto | null>(null);
  const [arrivals, setArrivals] = useState<AdminDashboardArrival[]>([]);
  const [arrivalDate, setArrivalDate] = useState(todayIsoUtc);
  const [loading, setLoading] = useState(true);
  const [arrivalsLoading, setArrivalsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [checkInBusyId, setCheckInBusyId] = useState<string | null>(null);

  const loadDashboard = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const d = await fetchAdminDashboard();
      setDash(d);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Dashboard failed');
      setDash(null);
    } finally {
      setLoading(false);
    }
  }, []);

  const loadArrivals = useCallback(async (date: string) => {
    setArrivalsLoading(true);
    try {
      const r = await fetchAdminArrivals(date);
      setArrivals(r.arrivals);
    } catch {
      setArrivals([]);
    } finally {
      setArrivalsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);

  useEffect(() => {
    loadArrivals(arrivalDate);
  }, [arrivalDate, loadArrivals]);

  const pending = dash?.pendingBookings ?? [];

  const handleCheckIn = async (bookingId: string) => {
    const ok = await confirmDialog({
      title: 'ยืนยันเช็คอิน',
      message: 'บันทึกการเช็คอินสำหรับการจองนี้?',
      confirmLabel: 'เช็คอิน',
      cancelLabel: 'ยกเลิก',
    });
    if (!ok) return;
    setCheckInBusyId(bookingId);
    try {
      await adminCheckInBooking(bookingId);
      await loadArrivals(arrivalDate);
      await loadDashboard();
      await alert({ title: 'สำเร็จ', message: 'บันทึกเช็คอินแล้ว' });
    } catch (e) {
      await alert({
        title: 'ไม่สำเร็จ',
        message: e instanceof Error ? e.message : 'เช็คอินไม่สำเร็จ',
      });
    } finally {
      setCheckInBusyId(null);
    }
  };

  const occDelta = useMemo(
    () => formatDelta(dash?.occupancyDeltaPct ?? null),
    [dash?.occupancyDeltaPct],
  );
  const revparDelta = useMemo(
    () => formatDelta(dash?.revparDeltaPct ?? null),
    [dash?.revparDeltaPct],
  );
  const revenueDelta = useMemo(
    () => formatDelta(dash?.revenueDeltaPct ?? null),
    [dash?.revenueDeltaPct],
  );

  const chart = dash?.chart ?? [];

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {error && (
        <p className="text-sm text-error">
          {error}{' '}
          <MotionButton
            variant="ghost"
            size="sm"
            type="button"
            onClick={() => void loadDashboard()}
            className="inline-flex uppercase underline-offset-2 normal-case font-body font-normal"
          >
            Retry
          </MotionButton>
        </p>
      )}

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-surface p-6 rounded-xl border border-outline-variant/20 shadow-sm">
          <span className="font-label text-xs uppercase tracking-widest text-on-surface-variant mb-2 block">
            Occupancy rate
          </span>
          <div className="flex items-end gap-3">
            <span className="font-headline text-4xl font-semibold text-on-surface tabular-nums">
              {loading ? '…' : `${dash?.occupancyRate ?? 0}%`}
            </span>
            <span
              className={`font-label text-xs font-bold mb-1 ${occDelta.className}`}
            >
              {occDelta.text}
            </span>
          </div>
          <p className="font-body text-[10px] text-on-surface-variant mt-2">
            Occupied / rentable suites (excl. maintenance)
          </p>
        </div>
        <div className="bg-surface p-6 rounded-xl border border-outline-variant/20 shadow-sm">
          <span className="font-label text-xs uppercase tracking-widest text-on-surface-variant mb-2 block">
            RevPAR (MTD)
          </span>
          <div className="flex items-end gap-3">
            <span className="font-headline text-4xl font-semibold text-on-surface tabular-nums">
              {loading ? '…' : formatMoney(dash?.revpar ?? 0)}
            </span>
            <span
              className={`font-label text-xs font-bold mb-1 ${revparDelta.className}`}
            >
              {revparDelta.text}
            </span>
          </div>
          <p className="font-body text-[10px] text-on-surface-variant mt-2">
            vs same period last month
          </p>
        </div>
        <div className="bg-surface p-6 rounded-xl border border-outline-variant/20 shadow-sm">
          <span className="font-label text-xs uppercase tracking-widest text-on-surface-variant mb-2 block">
            Pending actions
          </span>
          <div className="flex items-end gap-3">
            <span className="font-headline text-4xl font-semibold text-on-surface tabular-nums">
              {loading ? '…' : (dash?.pendingActionsCount ?? 0)}
            </span>
            <span className="font-label text-xs text-error font-bold mb-1">
              Bookings
            </span>
          </div>
          <p className="font-body text-[10px] text-on-surface-variant mt-2">
            Unpaid or pending confirmation
          </p>
        </div>
        <div className="bg-primary p-6 rounded-xl shadow-sm text-white flex flex-col justify-between">
          <span className="font-label text-xs uppercase tracking-widest text-primary-fixed mb-2 block">
            Total revenue (MTD)
          </span>
          <div className="flex items-end gap-3">
            <span className="font-headline text-4xl font-semibold tabular-nums">
              {loading ? '…' : formatMoney(dash?.revenueMtd ?? 0)}
            </span>
            <span
              className={`font-label text-xs font-bold mb-1 ${revenueDelta.className === 'text-green-600' ? 'text-green-200' : revenueDelta.className === 'text-error' ? 'text-red-200' : 'text-primary-fixed/80'}`}
            >
              {revenueDelta.text}
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-surface p-6 rounded-xl border border-outline-variant/20 shadow-sm flex flex-col">
          <div className="flex justify-between items-center mb-6">
            <h2 className="font-headline text-lg font-semibold text-on-surface">
              Revenue vs occupancy
            </h2>
            <span className="font-label text-xs text-on-surface-variant uppercase tracking-widest">
              This month (daily)
            </span>
          </div>
          <div className="flex-1 bg-surface-container-low rounded-lg border border-outline-variant/10 p-4 min-h-[300px] flex flex-col">
            {loading || chart.length === 0 ? (
              <div className="flex-1 flex items-center justify-center text-on-surface-variant text-sm">
                {loading ? 'Loading chart…' : 'No data for this month yet.'}
              </div>
            ) : (
              <div className="flex-1 flex items-end gap-1 min-h-[240px] pt-8">
                {chart.map((c) => (
                  <div
                    key={c.day}
                    className="flex-1 flex flex-col items-center gap-1 min-w-0"
                    title={`${c.label}: ${formatMoney(c.revenue)}, occ ${c.occupancyPct}%`}
                  >
                    <div className="w-full flex flex-col justify-end gap-0.5 h-40">
                      <div
                        className="w-full bg-primary/80 rounded-t-sm min-h-[2px] transition-all"
                        style={{
                          height: `${Math.max(c.revenueNorm * 100, 0.5)}%`,
                        }}
                      />
                      <div
                        className="w-full bg-amber-500/60 rounded-b-sm min-h-[2px]"
                        style={{
                          height: `${Math.max(c.occupancyNorm * 100, 0.5)}%`,
                        }}
                      />
                    </div>
                    <span className="font-label text-[8px] text-on-surface-variant truncate w-full text-center">
                      {c.day}
                    </span>
                  </div>
                ))}
              </div>
            )}
            {!loading && chart.length > 0 && (
              <div className="flex gap-4 mt-4 justify-center font-label text-[10px] uppercase text-on-surface-variant">
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-sm bg-primary/80" /> Revenue
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-sm bg-amber-500/60" />{' '}
                  Occupancy %
                </span>
              </div>
            )}
          </div>
        </div>

        <div className="bg-surface p-6 rounded-xl border border-outline-variant/20 shadow-sm flex flex-col">
          <div className="flex justify-between items-center mb-6">
            <h2 className="font-headline text-lg font-semibold text-on-surface">
              Booking queue
            </h2>
            <Link
              href="/admin/bookings"
              className="text-primary hover:underline font-label text-xs uppercase tracking-widest"
            >
              View all
            </Link>
          </div>
          <div className="flex-1 flex flex-col gap-4">
            {loading ? (
              <p className="text-sm text-on-surface-variant">Loading…</p>
            ) : pending.length === 0 ? (
              <p className="text-sm text-on-surface-variant italic">
                No pending bookings.
              </p>
            ) : (
              pending.map((req: AdminDashboardPendingBooking) => (
                <div
                  key={req.id}
                  className="p-4 rounded-lg border border-outline-variant/30 hover:border-primary/50 transition-colors"
                >
                  <div className="flex justify-between items-start mb-2">
                    <span className="font-label text-xs font-bold text-on-surface">
                      {req.suiteLabel}
                    </span>
                    <span
                      className={`font-label text-[10px] font-bold uppercase px-2 py-0.5 rounded ${
                        req.priority === 'URGENT'
                          ? 'bg-error/10 text-error'
                          : 'bg-surface-container text-on-surface-variant'
                      }`}
                    >
                      {req.priority === 'URGENT' ? 'Urgent' : 'Standard'}
                    </span>
                  </div>
                  <p className="font-body text-sm text-on-surface-variant mb-2">
                    {req.guestName} · {req.paymentStatus === 'UNPAID' ? 'Awaiting payment' : req.status}
                  </p>
                  <Link
                    href="/admin/bookings"
                    className="inline-block text-[10px] font-bold uppercase tracking-widest text-primary hover:underline"
                  >
                    Open in bookings
                  </Link>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      <div className="bg-surface rounded-xl border border-outline-variant/20 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-outline-variant/20 flex flex-wrap justify-between items-center gap-4">
          <h2 className="font-headline text-lg font-semibold text-on-surface">
            Arrivals · {arrivalDate}
          </h2>
          <div className="flex items-center gap-2">
            <button
              type="button"
              aria-label="Previous day"
              onClick={() => setArrivalDate((d) => addDaysIso(d, -1))}
              className="w-8 h-8 rounded border border-outline-variant flex items-center justify-center text-on-surface hover:bg-surface-container transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <button
              type="button"
              aria-label="Next day"
              onClick={() => setArrivalDate((d) => addDaysIso(d, 1))}
              className="w-8 h-8 rounded border border-outline-variant flex items-center justify-center text-on-surface hover:bg-surface-container transition-colors"
            >
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => setArrivalDate(todayIsoUtc())}
              className="ml-2 font-label text-xs uppercase tracking-widest text-primary hover:underline"
            >
              Today
            </button>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-surface-container-low border-b border-outline-variant/20">
                <th className="p-4 font-label text-xs font-bold uppercase tracking-widest text-on-surface-variant">
                  Guest
                </th>
                <th className="p-4 font-label text-xs font-bold uppercase tracking-widest text-on-surface-variant">
                  Suite
                </th>
                <th className="p-4 font-label text-xs font-bold uppercase tracking-widest text-on-surface-variant">
                  Check-in time
                </th>
                <th className="p-4 font-label text-xs font-bold uppercase tracking-widest text-on-surface-variant">
                  Status
                </th>
                <th className="p-4 font-label text-xs font-bold uppercase tracking-widest text-on-surface-variant text-right">
                  Action
                </th>
              </tr>
            </thead>
            <tbody className="font-body text-sm">
              {arrivalsLoading ? (
                <tr>
                  <td
                    colSpan={5}
                    className="p-8 text-center text-on-surface-variant"
                  >
                    Loading arrivals…
                  </td>
                </tr>
              ) : arrivals.length === 0 ? (
                <tr>
                  <td
                    colSpan={5}
                    className="p-8 text-center text-on-surface-variant"
                  >
                    No arrivals on this date.
                  </td>
                </tr>
              ) : (
                arrivals.map((arr) => {
                  const canCheckIn =
                    arr.status === 'CONFIRMED' &&
                    arr.paymentStatus === 'PAID' &&
                    !arr.checkedInAt;
                  return (
                    <tr
                      key={arr.bookingId}
                      className="border-b border-outline-variant/10 hover:bg-surface-container/50 transition-colors"
                    >
                      <td className="p-4 font-medium text-on-surface">
                        {arr.guestName}
                      </td>
                      <td className="p-4 text-on-surface-variant">
                        {arr.suiteName}{' '}
                        <span className="text-outline">({arr.roomNumber})</span>
                      </td>
                      <td className="p-4 text-on-surface-variant">
                        {arrivalTimeLabel(arr.checkInDate)}
                      </td>
                      <td className="p-4">
                        <span
                          className={`inline-block px-2 py-1 text-[10px] font-bold uppercase tracking-widest rounded ${
                            arr.checkedInAt
                              ? 'bg-green-100 text-green-800'
                              : arr.paymentStatus === 'UNPAID'
                                ? 'bg-amber-100 text-amber-800'
                                : 'bg-surface-container text-on-surface-variant'
                          }`}
                        >
                          {arrivalRowStatus(arr)}
                        </span>
                      </td>
                      <td className="p-4 text-right">
                        {canCheckIn ? (
                          <MotionButton
                            variant="ghost"
                            size="sm"
                            type="button"
                            disabled={checkInBusyId === arr.bookingId}
                            onClick={() => void handleCheckIn(arr.bookingId)}
                            className="text-primary !shadow-none hover:underline p-0 min-h-0 h-auto font-bold"
                          >
                            {checkInBusyId === arr.bookingId
                              ? 'Saving…'
                              : 'Check in'}
                          </MotionButton>
                        ) : (
                          <Link
                            href="/admin/inventory"
                            className="text-on-surface-variant font-label text-xs uppercase tracking-widest hover:text-primary"
                          >
                            Suites
                          </Link>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
