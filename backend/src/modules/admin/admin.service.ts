import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { SuiteRepository } from '../suite/suite.repository';

function utcDayRange(ref: Date): { start: Date; end: Date } {
  const y = ref.getUTCFullYear();
  const m = ref.getUTCMonth();
  const d = ref.getUTCDate();
  return {
    start: new Date(Date.UTC(y, m, d, 0, 0, 0, 0)),
    end: new Date(Date.UTC(y, m, d, 23, 59, 59, 999)),
  };
}

function utcMonthStart(ref: Date): Date {
  return new Date(Date.UTC(ref.getUTCFullYear(), ref.getUTCMonth(), 1, 0, 0, 0, 0));
}

function addUtcMonths(ref: Date, delta: number): Date {
  return new Date(
    Date.UTC(ref.getUTCFullYear(), ref.getUTCMonth() + delta, 1, 0, 0, 0, 0),
  );
}

function overlapsDay(
  checkIn: Date,
  checkOut: Date,
  dayStart: Date,
  dayEnd: Date,
): boolean {
  return checkIn <= dayEnd && checkOut > dayStart;
}

@Injectable()
export class AdminService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly suiteRepository: SuiteRepository,
  ) {}

  async getNotifications(sinceIso?: string) {
    const since = sinceIso ? new Date(sinceIso) : null;
    const profileUser =
      (await this.prisma.user.findFirst({
        where: { status: 'ACTIVE', role: 'ADMIN' },
      })) ??
      (await this.prisma.user.findFirst({ where: { status: 'ACTIVE' } }));

    const recentBookings = await this.prisma.booking.findMany({
      orderBy: { createdAt: 'desc' },
      take: 12,
      include: { suite: { select: { name: true } } },
    });

    const recentPaid = await this.prisma.transaction.findMany({
      where: { status: 'COMPLETED' },
      orderBy: { transactionDate: 'desc' },
      take: 12,
      include: {
        booking: { include: { suite: { select: { name: true } } } },
      },
    });

    type NotifItem = {
      id: string;
      kind: 'BOOKING' | 'PAYMENT';
      message: string;
      createdAt: string;
      bookingId?: string;
    };

    const items: NotifItem[] = [];

    for (const b of recentBookings) {
      items.push({
        id: `b-${b.id}`,
        kind: 'BOOKING',
        message: `New booking: ${b.suite.name} (${b.paymentStatus === 'UNPAID' ? 'awaiting payment' : b.status})`,
        createdAt: b.createdAt.toISOString(),
        bookingId: b.id,
      });
    }

    for (const t of recentPaid) {
      items.push({
        id: `t-${t.id}`,
        kind: 'PAYMENT',
        message: `Payment completed: ${t.booking.suite.name}`,
        createdAt: t.transactionDate.toISOString(),
        bookingId: t.bookingId,
      });
    }

    items.sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );

    const top = items.slice(0, 20);
    const unreadCount = since
      ? top.filter((i) => new Date(i.createdAt) > since).length
      : top.length;

    return {
      profile: profileUser
        ? {
            name: profileUser.name,
            role: profileUser.role,
            email: profileUser.email,
          }
        : null,
      items: top,
      unreadCount,
    };
  }

  async getDashboard() {
    await this.suiteRepository.reconcileAllSuiteStatuses();

    const now = new Date();
    const rentableSuites = await this.prisma.suite.count({
      where: { status: { not: 'MAINTENANCE' } },
    });
    const totalSuites = await this.prisma.suite.count();
    const occupied = await this.prisma.suite.count({
      where: { status: 'OCCUPIED' },
    });
    const occupancyRate =
      rentableSuites > 0
        ? Math.round((occupied / rentableSuites) * 1000) / 10
        : 0;

    const monthStart = utcMonthStart(now);
    const mtdTx = await this.prisma.transaction.findMany({
      where: {
        status: 'COMPLETED',
        transactionDate: { gte: monthStart },
      },
    });
    const revenueMtd = mtdTx.reduce((s, t) => s + Number(t.amount), 0);

    const dayOfMonth = now.getUTCDate();
    const revparDenominator = Math.max(rentableSuites * dayOfMonth, 1);
    const revpar = revenueMtd / revparDenominator;

    const prevMonthStart = addUtcMonths(now, -1);
    const prevMonthSamePeriodEnd = new Date(
      Date.UTC(
        now.getUTCFullYear(),
        now.getUTCMonth() - 1,
        dayOfMonth,
        23,
        59,
        59,
        999,
      ),
    );
    const prevMtdTx = await this.prisma.transaction.findMany({
      where: {
        status: 'COMPLETED',
        transactionDate: {
          gte: prevMonthStart,
          lte: prevMonthSamePeriodEnd,
        },
      },
    });
    const prevRevenueMtd = prevMtdTx.reduce((s, t) => s + Number(t.amount), 0);
    const prevRevparDenominator = Math.max(rentableSuites * dayOfMonth, 1);
    const prevRevpar = prevRevenueMtd / prevRevparDenominator;

    const revenueDeltaPct =
      prevRevenueMtd > 0
        ? Math.round(
            ((revenueMtd - prevRevenueMtd) / prevRevenueMtd) * 1000,
          ) / 10
        : null;
    const revparDeltaPct =
      prevRevpar > 0
        ? Math.round(((revpar - prevRevpar) / prevRevpar) * 1000) / 10
        : null;

    const pendingBookings = await this.prisma.booking.findMany({
      where: {
        OR: [{ status: 'PENDING' }, { paymentStatus: 'UNPAID' }],
      },
      orderBy: { createdAt: 'desc' },
      take: 10,
      include: { guest: true, suite: true },
    });

    const pendingActionsCount = await this.prisma.booking.count({
      where: {
        OR: [{ status: 'PENDING' }, { paymentStatus: 'UNPAID' }],
      },
    });

    const { start: todayStart, end: todayEnd } = utcDayRange(now);
    const arrivalsToday = await this.prisma.booking.findMany({
      where: {
        checkInDate: { gte: todayStart, lte: todayEnd },
      },
      orderBy: { checkInDate: 'asc' },
      include: { guest: true, suite: true },
    });

    const y = now.getUTCFullYear();
    const m = now.getUTCMonth();
    const chart: {
      day: number;
      label: string;
      revenue: number;
      occupancyPct: number;
    }[] = [];

    const monthBookings = await this.prisma.booking.findMany({
      where: {
        status: 'CONFIRMED',
        paymentStatus: 'PAID',
        checkOutDate: { gt: monthStart },
        checkInDate: { lt: new Date(Date.UTC(y, m + 1, 1, 0, 0, 0, 0)) },
      },
      select: {
        suiteId: true,
        checkInDate: true,
        checkOutDate: true,
      },
    });

    for (let day = 1; day <= dayOfMonth; day++) {
      const d0 = new Date(Date.UTC(y, m, day, 0, 0, 0, 0));
      const d1 = new Date(Date.UTC(y, m, day, 23, 59, 59, 999));
      const dayRevenue = mtdTx
        .filter((t) => {
          const txd = t.transactionDate;
          return txd >= d0 && txd <= d1;
        })
        .reduce((s, t) => s + Number(t.amount), 0);

      const suiteIds = new Set<string>();
      for (const b of monthBookings) {
        if (overlapsDay(b.checkInDate, b.checkOutDate, d0, d1)) {
          suiteIds.add(b.suiteId);
        }
      }
      const occupancyPct =
        rentableSuites > 0
          ? Math.round((suiteIds.size / rentableSuites) * 1000) / 10
          : 0;

      chart.push({
        day,
        label: `${m + 1}/${day}`,
        revenue: dayRevenue,
        occupancyPct,
      });
    }

    const maxRev = Math.max(...chart.map((c) => c.revenue), 1);
    const maxOcc = 100;

    return {
      occupancyRate,
      occupancyDeltaPct: null as number | null,
      revpar: Math.round(revpar * 100) / 100,
      revparDeltaPct,
      pendingActionsCount,
      revenueMtd: Math.round(revenueMtd * 100) / 100,
      revenueDeltaPct,
      chart: chart.map((c) => ({
        ...c,
        revenueNorm: c.revenue / maxRev,
        occupancyNorm: c.occupancyPct / maxOcc,
      })),
      pendingBookings: pendingBookings.map((b) => ({
        id: b.id,
        suiteLabel: `${b.suite.roomNumber} · ${b.suite.name}`,
        guestName: `${b.guest.firstName} ${b.guest.lastName}`.trim(),
        createdAt: b.createdAt.toISOString(),
        paymentStatus: b.paymentStatus,
        status: b.status,
        priority:
          b.paymentStatus === 'UNPAID' &&
          Date.now() - b.createdAt.getTime() < 48 * 3600 * 1000
            ? ('URGENT' as const)
            : ('STANDARD' as const),
      })),
      todayArrivals: arrivalsToday.map((b) => ({
        bookingId: b.id,
        guestName: `${b.guest.firstName} ${b.guest.lastName}`.trim(),
        suiteName: b.suite.name,
        roomNumber: b.suite.roomNumber,
        checkInDate: b.checkInDate.toISOString(),
        status: b.status,
        paymentStatus: b.paymentStatus,
        checkedInAt: b.checkedInAt?.toISOString() ?? null,
      })),
      meta: {
        totalSuites,
        rentableSuites,
        occupiedSuites: occupied,
        asOf: now.toISOString(),
      },
    };
  }

  async getArrivalsForDate(isoDate: string) {
    await this.suiteRepository.reconcileAllSuiteStatuses();
    const ref = new Date(isoDate);
    if (Number.isNaN(ref.getTime())) {
      return { date: isoDate, arrivals: [] as unknown[] };
    }
    const { start, end } = utcDayRange(ref);
    const rows = await this.prisma.booking.findMany({
      where: { checkInDate: { gte: start, lte: end } },
      orderBy: { checkInDate: 'asc' },
      include: { guest: true, suite: true },
    });
    return {
      date: start.toISOString().slice(0, 10),
      arrivals: rows.map((b) => ({
        bookingId: b.id,
        guestName: `${b.guest.firstName} ${b.guest.lastName}`.trim(),
        suiteName: b.suite.name,
        roomNumber: b.suite.roomNumber,
        checkInDate: b.checkInDate.toISOString(),
        status: b.status,
        paymentStatus: b.paymentStatus,
        checkedInAt: b.checkedInAt?.toISOString() ?? null,
      })),
    };
  }
}
