import { apiRequestJson, apiRequestJsonWithAuth } from '@/lib/api/client';
import { API_ENDPOINTS } from '@/lib/api/endpoints';
import type { BookingDto } from '@/lib/types/booking';

export type CreateBookingPayload = {
  suiteId: string;
  checkInDate: string;
  checkOutDate: string;
  guest: {
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
  };
};

export async function createBooking(
  payload: CreateBookingPayload,
): Promise<BookingDto> {
  return apiRequestJson<BookingDto>(
    API_ENDPOINTS.bookings,
    'Could not complete booking',
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    },
  );
}

export async function fetchBookingsByEmail(
  email: string,
): Promise<BookingDto[]> {
  const q = encodeURIComponent(email.trim());
  return apiRequestJson<BookingDto[]>(
    `${API_ENDPOINTS.bookings}?email=${q}`,
    'Could not load bookings',
  );
}

export async function fetchBookingById(
  id: string,
  guestEmail: string,
): Promise<BookingDto> {
  const q = encodeURIComponent(guestEmail.trim());
  return apiRequestJson<BookingDto>(
    `${API_ENDPOINTS.bookings}/${id}?email=${q}`,
    'Could not load booking',
  );
}

export type CompletePaymentPayload = {
  paymentMethod: string;
  guestEmail: string;
};

export async function completeBookingPayment(
  bookingId: string,
  payload: CompletePaymentPayload,
): Promise<BookingDto> {
  return apiRequestJson<BookingDto>(
    `${API_ENDPOINTS.bookings}/${bookingId}/payment`,
    'Payment could not be completed',
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    },
  );
}

export async function fetchAdminBookings(): Promise<BookingDto[]> {
  return apiRequestJson<BookingDto[]>(
    `${API_ENDPOINTS.bookings}/admin/list`,
    'Could not load admin bookings',
  );
}

export async function adminCheckInBooking(bookingId: string): Promise<BookingDto> {
  return apiRequestJsonWithAuth<BookingDto>(
    `${API_ENDPOINTS.bookings}/admin/${bookingId}/check-in`,
    'Check-in failed',
    { method: 'PATCH' },
  );
}
