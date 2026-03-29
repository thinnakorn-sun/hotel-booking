export interface AdminDashboardChartDay {
  day: number;
  label: string;
  revenue: number;
  occupancyPct: number;
  revenueNorm: number;
  occupancyNorm: number;
}

export interface AdminDashboardPendingBooking {
  id: string;
  suiteLabel: string;
  guestName: string;
  createdAt: string;
  paymentStatus: string;
  status: string;
  priority: 'URGENT' | 'STANDARD';
}

export interface AdminDashboardArrival {
  bookingId: string;
  guestName: string;
  suiteName: string;
  roomNumber: string;
  checkInDate: string;
  status: string;
  paymentStatus: string;
  checkedInAt: string | null;
}

export interface AdminDashboardDto {
  occupancyRate: number;
  occupancyDeltaPct: number | null;
  revpar: number;
  revparDeltaPct: number | null;
  pendingActionsCount: number;
  revenueMtd: number;
  revenueDeltaPct: number | null;
  chart: AdminDashboardChartDay[];
  pendingBookings: AdminDashboardPendingBooking[];
  todayArrivals: AdminDashboardArrival[];
  meta: {
    totalSuites: number;
    rentableSuites: number;
    occupiedSuites: number;
    asOf: string;
  };
}

export interface AdminArrivalsDto {
  date: string;
  arrivals: AdminDashboardArrival[];
}

export interface AdminNotificationItem {
  id: string;
  kind: 'BOOKING' | 'PAYMENT';
  message: string;
  createdAt: string;
  bookingId?: string;
}

export interface AdminNotificationsDto {
  profile: { name: string; role: string; email?: string } | null;
  items: AdminNotificationItem[];
  unreadCount: number;
}
