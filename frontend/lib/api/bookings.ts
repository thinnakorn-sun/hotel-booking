import { apiRequestJson, apiRequestJsonWithAuth } from "@/lib/api/client";
import { API_ENDPOINTS } from "@/lib/api/endpoints";
import { getMockBookings } from "@/lib/demo/mock-store";
import type { BookingDto } from "@/lib/types/booking";

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
    "Could not complete booking",
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    },
  );
}

export async function fetchBookingsByEmail(
  email: string,
): Promise<BookingDto[]> {
  const q = encodeURIComponent(email.trim());
  try {
    const data = await apiRequestJson<BookingDto[]>(
      `${API_ENDPOINTS.bookings}?email=${q}`,
      "Could not load bookings",
    );
    if (data.length > 0) return data;
  } catch {
    // use fallback
  }
  const normalized = email.trim().toLowerCase();
  return getMockBookings().filter(
    (b) => b.guest.email.toLowerCase() === normalized,
  );
}

export async function fetchBookingById(
  id: string,
  guestEmail: string,
): Promise<BookingDto> {
  const q = encodeURIComponent(guestEmail.trim());
  try {
    return await apiRequestJson<BookingDto>(
      `${API_ENDPOINTS.bookings}/${id}?email=${q}`,
      "Could not load booking",
    );
  } catch {
    const normalized = guestEmail.trim().toLowerCase();
    const booking = getMockBookings().find(
      (b) => b.id === id && b.guest.email.toLowerCase() === normalized,
    );
    if (!booking) throw new Error("Could not load booking");
    return booking;
  }
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
    "Payment could not be completed",
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    },
  );
}

export async function fetchAdminBookings(): Promise<BookingDto[]> {
  try {
    const data = await apiRequestJson<BookingDto[]>(
      `${API_ENDPOINTS.bookings}/admin/list`,
      "Could not load admin bookings",
    );
    if (data.length > 0) return data;
  } catch {
    // use fallback
  }
  return getMockBookings();
}

export async function adminCheckInBooking(
  bookingId: string,
): Promise<BookingDto> {
  return apiRequestJsonWithAuth<BookingDto>(
    `${API_ENDPOINTS.bookings}/admin/${bookingId}/check-in`,
    "Check-in failed",
    { method: "PATCH" },
  );
}
