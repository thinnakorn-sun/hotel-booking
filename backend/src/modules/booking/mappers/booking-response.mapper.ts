import { Injectable } from '@nestjs/common';
import type { Booking, Guest, Suite } from '../../../prisma-client';
import type { BookingWithRelationsResponse } from '../types/booking-response.type';

type BookingWithJoins = Booking & {
  suite: Suite;
  guest: Guest;
};

@Injectable()
export class BookingResponseMapper {
  toResponse(row: BookingWithJoins): BookingWithRelationsResponse {
    return {
      id: row.id,
      guestId: row.guestId,
      suiteId: row.suiteId,
      checkInDate: row.checkInDate.toISOString(),
      checkOutDate: row.checkOutDate.toISOString(),
      totalAmount: Number(row.totalAmount),
      status: row.status,
      paymentMethod: row.paymentMethod ?? null,
      paymentStatus: row.paymentStatus,
      checkedInAt: row.checkedInAt?.toISOString() ?? null,
      createdAt: row.createdAt.toISOString(),
      updatedAt: row.updatedAt.toISOString(),
      suite: {
        id: row.suite.id,
        name: row.suite.name,
        roomNumber: row.suite.roomNumber,
        pricePerNight: Number(row.suite.pricePerNight),
      },
      guest: {
        id: row.guest.id,
        firstName: row.guest.firstName,
        lastName: row.guest.lastName,
        email: row.guest.email,
      },
    };
  }

  toResponseList(rows: BookingWithJoins[]): BookingWithRelationsResponse[] {
    return rows.map((r) => this.toResponse(r));
  }
}
