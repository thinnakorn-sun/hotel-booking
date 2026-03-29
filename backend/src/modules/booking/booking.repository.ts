import { Injectable } from '@nestjs/common';
import { Prisma } from '../../prisma-client';
import type { Booking, Guest, Suite } from '../../prisma-client';
import { PrismaService } from '../../database/prisma.service';

export type CreateBookingReservedParams = {
  guestId: string;
  suiteId: string;
  checkInDate: Date;
  checkOutDate: Date;
  totalAmount: number;
};

export type BookingWithRelations = Booking & {
  suite: Suite;
  guest: Guest;
};

@Injectable()
export class BookingRepository {
  constructor(private readonly prisma: PrismaService) {}

  upsertGuest(data: {
    email: string;
    firstName: string;
    lastName: string;
    phone?: string;
  }): Promise<Guest> {
    return this.prisma.guest.upsert({
      where: { email: data.email },
      create: {
        email: data.email,
        firstName: data.firstName,
        lastName: data.lastName,
        phone: data.phone,
      },
      update: {
        firstName: data.firstName,
        lastName: data.lastName,
        phone: data.phone,
      },
    });
  }

  createBookingReserved(
    params: CreateBookingReservedParams,
  ): Promise<BookingWithRelations | null> {
    return this.prisma.$transaction(async (tx) => {
      const reserved = await tx.suite.updateMany({
        where: { id: params.suiteId, status: 'AVAILABLE' },
        data: { status: 'RESERVED' },
      });
      if (reserved.count !== 1) {
        return null;
      }
      return tx.booking.create({
        data: {
          guestId: params.guestId,
          suiteId: params.suiteId,
          checkInDate: params.checkInDate,
          checkOutDate: params.checkOutDate,
          totalAmount: new Prisma.Decimal(params.totalAmount),
          status: 'PENDING',
          paymentStatus: 'UNPAID',
        },
        include: { suite: true, guest: true },
      });
    });
  }

  findByGuestEmail(email: string): Promise<BookingWithRelations[]> {
    return this.prisma.booking.findMany({
      where: { guest: { email } },
      include: { suite: true, guest: true },
      orderBy: { checkInDate: 'desc' },
    });
  }

  findById(id: string): Promise<BookingWithRelations | null> {
    return this.prisma.booking.findUnique({
      where: { id },
      include: { suite: true, guest: true },
    });
  }

  findAllOrdered(): Promise<BookingWithRelations[]> {
    return this.prisma.booking.findMany({
      include: { suite: true, guest: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  markCheckedIn(id: string): Promise<BookingWithRelations> {
    return this.prisma.booking.update({
      where: { id },
      data: { checkedInAt: new Date() },
      include: { suite: true, guest: true },
    });
  }

  recordPayment(
    bookingId: string,
    paymentMethod: string,
    amount: Prisma.Decimal,
  ): Promise<BookingWithRelations> {
    return this.prisma.$transaction(async (tx) => {
      await tx.transaction.create({
        data: {
          bookingId,
          amount,
          description: `Payment via ${paymentMethod}`,
          status: 'COMPLETED',
        },
      });
      return tx.booking.update({
        where: { id: bookingId },
        data: {
          paymentMethod,
          paymentStatus: 'PAID',
          status: 'CONFIRMED',
        },
        include: { suite: true, guest: true },
      });
    });
  }
}
