import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';

export type LedgerTransactionRow = {
  id: string;
  transactionDate: string;
  amount: string;
  status: string;
  description: string;
  bookingId: string;
  guestName: string;
  guestEmail: string;
  suiteName: string;
  roomNumber: string;
};

@Injectable()
export class LedgerService {
  constructor(private readonly prisma: PrismaService) {}

  async findAllTransactionsForAdmin(): Promise<LedgerTransactionRow[]> {
    const rows = await this.prisma.transaction.findMany({
      orderBy: { transactionDate: 'desc' },
      include: {
        booking: {
          include: { guest: true, suite: true },
        },
      },
    });

    return rows.map((t) => ({
      id: t.id,
      transactionDate: t.transactionDate.toISOString(),
      amount: t.amount.toString(),
      status: t.status,
      description: t.description,
      bookingId: t.bookingId,
      guestName:
        `${t.booking.guest.firstName} ${t.booking.guest.lastName}`.trim(),
      guestEmail: t.booking.guest.email,
      suiteName: t.booking.suite.name,
      roomNumber: t.booking.suite.roomNumber,
    }));
  }
}
