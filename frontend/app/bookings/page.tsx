'use client';

import Link from 'next/link';
import { useCallback, useEffect, useState } from 'react';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { useAppDialog } from '@/components/providers/app-dialog-provider';
import { MotionButton } from '@/components/ui/motion-button';
import { fetchBookingsByEmail } from '@/lib/api/bookings';
import type { BookingDto } from '@/lib/types/booking';

const STORAGE_KEY = 'booking_guest_email';

export default function BookingsPage() {
  const { alert } = useAppDialog();
  const [email, setEmail] = useState('');
  const [bookings, setBookings] = useState<BookingDto[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) return;
    setEmail(saved);
    let cancelled = false;
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await fetchBookingsByEmail(saved);
        if (!cancelled) setBookings(data);
      } catch (e) {
        if (!cancelled) {
          setBookings([]);
          setError(e instanceof Error ? e.message : 'Could not load bookings');
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const load = useCallback(async () => {
    const trimmed = email.trim();
    if (!trimmed) {
      setError('Please enter your email.');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const data = await fetchBookingsByEmail(trimmed);
      setBookings(data);
      localStorage.setItem(STORAGE_KEY, trimmed);
    } catch (e) {
      setBookings([]);
      setError(e instanceof Error ? e.message : 'Could not load bookings');
    } finally {
      setLoading(false);
    }
  }, [email, alert]);

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      <main className="flex-grow pt-28 pb-24 px-6 md:px-12 max-w-3xl mx-auto w-full">
        <h1 className="font-headline text-3xl md:text-4xl font-semibold text-on-background mb-2">
          My Bookings
        </h1>
        <p className="font-body text-on-surface-variant mb-8">
          Enter the email used when making a reservation to see your requests.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 mb-10">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            className="flex-1 bg-surface border border-outline-variant/30 rounded-lg px-4 py-3 font-body text-sm outline-none focus:border-primary"
          />
          <MotionButton
            type="button"
            variant="primary"
            size="lg"
            onClick={() => void load()}
            disabled={loading}
            className="bloom-effect px-8"
          >
            {loading ? 'Loading…' : 'Show bookings'}
          </MotionButton>
        </div>
        {error && (
          <p className="text-error font-body text-sm mb-6">{error}</p>
        )}
        {bookings.length === 0 && !loading && !error ? (
          <p className="font-body text-on-surface-variant">
            No bookings loaded yet. Enter your email and tap Show bookings.
          </p>
        ) : (
          <ul className="space-y-6">
            {bookings.map((b) => {
              const pay = b.paymentStatus ?? 'UNPAID';
              return (
              <li
                key={b.id}
                className="bg-surface border border-outline-variant/20 rounded-xl p-6 shadow-sm"
              >
                <div className="flex justify-between items-start gap-4 flex-wrap">
                  <div>
                    <h2 className="font-headline text-xl text-on-surface">
                      {b.suite.name}
                    </h2>
                    <p className="font-label text-xs text-primary mt-1">
                      {b.suite.roomNumber}
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2 justify-end">
                    <span className="font-label text-xs font-bold uppercase tracking-widest px-3 py-1 rounded-full bg-surface-container text-on-surface">
                      {b.status}
                    </span>
                    <span
                      className={`font-label text-xs font-bold uppercase tracking-widest px-3 py-1 rounded-full ${
                        pay === 'PAID'
                          ? 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-200'
                          : 'bg-amber-100 text-amber-900 dark:bg-amber-900/30 dark:text-amber-100'
                      }`}
                    >
                      {pay === 'PAID' ? 'Paid' : 'Payment pending'}
                    </span>
                  </div>
                </div>
                <p className="font-body text-sm text-on-surface-variant mt-4">
                  {new Date(b.checkInDate).toLocaleDateString()} —{' '}
                  {new Date(b.checkOutDate).toLocaleDateString()}
                </p>
                <p className="font-headline text-lg text-primary mt-2">
                  ${b.totalAmount.toFixed(2)}
                </p>
                {pay === 'PAID' && b.paymentMethod && (
                  <p className="font-body text-xs text-on-surface-variant mt-2">
                    Paid via {b.paymentMethod.replace(/_/g, ' ')}
                  </p>
                )}
                {pay !== 'PAID' && (
                  <Link
                    href={`/payment/${b.id}`}
                    className="inline-block mt-4 font-label text-xs font-bold uppercase tracking-widest text-primary border-b border-primary hover:opacity-80"
                  >
                    Complete payment
                  </Link>
                )}
              </li>
            );
            })}
          </ul>
        )}
      </main>
      <Footer />
    </div>
  );
}
