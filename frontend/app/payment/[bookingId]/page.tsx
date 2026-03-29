'use client';

import { useCallback, useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { useAppDialog } from '@/components/providers/app-dialog-provider';
import { MotionButton } from '@/components/ui/motion-button';
import {
  completeBookingPayment,
  fetchBookingById,
} from '@/lib/api/bookings';
import type { BookingDto } from '@/lib/types/booking';
import {
  PAYMENT_OPTIONS,
  type PaymentMethodCode,
} from '@/lib/constants/payment-methods';

const GUEST_EMAIL_KEY = 'booking_guest_email';

export default function PaymentPage() {
  const { alert, confirm: confirmDialog } = useAppDialog();
  const router = useRouter();
  const params = useParams();
  const bookingId = params.bookingId as string;

  const [booking, setBooking] = useState<BookingDto | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethodCode | ''>(
    '',
  );
  const [payError, setPayError] = useState<string | null>(null);
  const [paying, setPaying] = useState(false);

  const load = useCallback(async () => {
    const email = localStorage.getItem(GUEST_EMAIL_KEY);
    if (!email?.trim()) {
      setLoadError('No guest email on this device. Start again from Rooms.');
      return;
    }
    setLoadError(null);
    try {
      const b = await fetchBookingById(bookingId, email);
      setBooking(b);
      if (b.paymentStatus === 'PAID') {
        setSelectedMethod((b.paymentMethod as PaymentMethodCode) || '');
      }
    } catch (e) {
      setBooking(null);
      setLoadError(
        e instanceof Error ? e.message : 'Could not load this booking.',
      );
    }
  }, [bookingId]);

  useEffect(() => {
    load();
  }, [load]);

  const handlePay = async (e: React.FormEvent) => {
    e.preventDefault();
    const email = localStorage.getItem(GUEST_EMAIL_KEY);
    if (!email?.trim() || !selectedMethod || !booking) return;
    const ok = await confirmDialog({
      title: 'ยืนยันการชำระเงิน',
      message: `ชำระ $${booking.totalAmount.toFixed(2)} ด้วยวิธีที่เลือก?`,
      confirmLabel: 'ชำระเงิน',
      cancelLabel: 'ยกเลิก',
    });
    if (!ok) return;
    setPayError(null);
    setPaying(true);
    try {
      await completeBookingPayment(booking.id, {
        paymentMethod: selectedMethod,
        guestEmail: email.trim(),
      });
      await load();
      await alert({ title: 'สำเร็จ', message: 'บันทึกการชำระเงินแล้ว' });
      router.push('/bookings');
    } catch (err) {
      setPayError(
        err instanceof Error ? err.message : 'Payment could not be processed.',
      );
    } finally {
      setPaying(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      <main className="flex-grow pt-28 pb-24 px-6 md:px-12 max-w-2xl mx-auto w-full">
        <h1 className="font-headline text-3xl md:text-4xl font-semibold text-on-background mb-2">
          Complete payment
        </h1>
        <p className="font-body text-on-surface-variant mb-8">
          Choose how you would like to pay for your stay. This is a checkout
          simulation: the booking is updated in the database when you confirm.
        </p>

        {loadError && (
          <p className="text-error font-body text-sm mb-6">{loadError}</p>
        )}

        {booking && (
          <div className="bg-surface border border-outline-variant/20 rounded-xl p-6 mb-8 shadow-sm">
            <h2 className="font-headline text-xl text-on-surface">
              {booking.suite.name}
            </h2>
            <p className="font-label text-xs text-primary mt-1">
              {booking.suite.roomNumber}
            </p>
            <p className="font-body text-sm text-on-surface-variant mt-4">
              {new Date(booking.checkInDate).toLocaleDateString()} —{' '}
              {new Date(booking.checkOutDate).toLocaleDateString()}
            </p>
            <p className="font-headline text-2xl text-primary mt-4">
              ${booking.totalAmount.toFixed(2)}
            </p>
            <p className="font-label text-xs uppercase tracking-widest text-on-surface-variant mt-4">
              Booking: {booking.status} · Payment: {booking.paymentStatus}
            </p>
          </div>
        )}

        {booking && booking.paymentStatus === 'PAID' && (
          <p className="font-body text-green-700 dark:text-green-400 mb-6">
            This reservation is already paid. You can review it under My
            Bookings.
          </p>
        )}

        {booking && booking.paymentStatus !== 'PAID' && (
          <form onSubmit={handlePay} className="space-y-6">
            <fieldset>
              <legend className="font-label text-xs font-bold uppercase tracking-widest text-on-surface-variant mb-4 block">
                Payment method
              </legend>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {PAYMENT_OPTIONS.map((opt) => (
                  <label
                    key={opt.code}
                    className={`flex items-center gap-3 p-4 rounded-lg border cursor-pointer transition-colors ${
                      selectedMethod === opt.code
                        ? 'border-primary bg-primary/5'
                        : 'border-outline-variant/30 hover:border-primary/50'
                    }`}
                  >
                    <input
                      type="radio"
                      name="paymentMethod"
                      value={opt.code}
                      checked={selectedMethod === opt.code}
                      onChange={() => setSelectedMethod(opt.code)}
                      className="accent-primary"
                    />
                    <span className="font-body text-sm text-on-surface">
                      {opt.label}
                    </span>
                  </label>
                ))}
              </div>
            </fieldset>
            {payError && (
              <p className="text-error font-body text-sm">{payError}</p>
            )}
            <div className="flex flex-col sm:flex-row gap-3">
              <MotionButton
                type="submit"
                variant="primary"
                size="lg"
                disabled={!selectedMethod || paying}
                className="flex-1 bloom-effect py-3"
              >
                {paying ? 'Processing…' : 'Confirm payment'}
              </MotionButton>
              <MotionButton
                type="button"
                variant="outline"
                size="lg"
                onClick={() => router.push('/bookings')}
                className="px-6 py-3"
              >
                Pay later
              </MotionButton>
            </div>
          </form>
        )}
      </main>
      <Footer />
    </div>
  );
}
