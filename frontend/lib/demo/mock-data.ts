import type { BookingDto } from "@/lib/types/booking";
import type {
  AdminArrivalsDto,
  AdminDashboardDto,
  AdminNotificationsDto,
} from "@/lib/types/dashboard";
import type { LedgerTransactionDto } from "@/lib/types/ledger";
import type { StaffUserDto } from "@/lib/types/staff-user";
import type { SuiteDto } from "@/lib/types/suite";

type SuiteCategory = "SUITE" | "PENTHOUSE" | "VILLA";

const now = new Date();
const iso = (deltaDays: number) =>
  new Date(now.getTime() + deltaDays * 24 * 60 * 60 * 1000).toISOString();

function makeSuite(
  id: string,
  roomNumber: string,
  name: string,
  category: SuiteCategory,
  pricePerNight: number,
  imageUrl: string,
): SuiteDto {
  return {
    id,
    roomNumber,
    name,
    description: `${name} crafted for premium comfort, ideal for showcase demo stays.`,
    pricePerNight,
    status: "AVAILABLE",
    category,
    imageUrl,
    createdAt: iso(-30),
    updatedAt: iso(-1),
  };
}

const IMAGES = [
  "https://lh3.googleusercontent.com/aida-public/AB6AXuDEVYfduJyLBDL19UsRkYWCN88z1jVgjKpmMUZZrfKDS5QPvzdi7ZEA3pzrQf49EI5rVTm50Rv6z3zbHov_s-ub39tAmRe9JM_qa6in6jUuhNZQq-hV-jwp6Kuw5bMMx0JrOynlMTUPBZYASBa7pPITsBctASRIjIGYdbM07lJrgvQV9gAG1xHQLj0Rj9zYpVCeU6wnPixEwoRKh0-rOcwVPCjxg5j_oFZ91L0p-jzqYRDyipw14tOwVq-LxK3slVD-1J0AdXzuepa8",
  "https://lh3.googleusercontent.com/aida-public/AB6AXuDferO6PFhl1nulZeVCIEFy_KImUrl8TPQUjJLPDNT3O1HH-Hc0NeCNH7AYGgoxE2qcB-VCV9F-Ts1FGcz4iPcHMcRm31SM2inHgDT-0AX7uXyOagf7Nf0iZJSnEb4xSA6w3689N6UpchdvyeFrlKSI5lo9nEq8SoNiEDjCKMX9uFx5Vwn7saDGKdDnD7ru4Hzk4A3I4IVwWkUw1owTDOximEk9FxtxtPNRhDRdfA1AjQelzTF0LJYUtn_YgWN9emabaKIl2kAUsX2R",
  "https://lh3.googleusercontent.com/aida-public/AB6AXuBS_CqY2c984jOZqXEFk3GqAWKTKthJmV_T7G1lhY7BO0UMT-1tiEsYhPhgcPp2ok62n3EJ4XCDVsP_BmnqwuitMDWClMi5vbVEdFyXPdYB9zszeQWbqKm9-TDRGNws1TnvI4_dV6gvxTlzwvnbX2qUiLEXLxds1dCEhW7CBmZq8xVHSHW0MgIf27q6s5yCcDbZIN35iwmeQ0hnrb5msNVWPMeS3KvhsmQEuKvGaaoTdFJOpELt4OehTbqR00MynI0CYoXFYJBTbR1r",
  "https://lh3.googleusercontent.com/aida-public/AB6AXuCt6NW4_vPQl_us_8XJ9SmFrs4VAfhcrxjHJR_EXjQZSO6-aBd_YuHTiUzbmT0rUj06RUEPQlnFdXdmNyVM_DckxVj2UuW4M7f7_qUx1w4Yg7XsY04dsCPtONxcqNfbmbOcg4quZ9BUubLU1XVuRjsCyoX0k5fYllkYNv4K5OOaniSrKcDF2xr_fiw4p0Z-PV0ZKhNKMrxVVfIIapSa_TCzSpzpBE-am9Pybw3z3FNF-2taIzaaU7hVOMlbuz8WcdnqNaq4t_k6QCr8",
  "https://lh3.googleusercontent.com/aida-public/AB6AXuD6yFO4cKW6GizrLAmc6ES_DUR5KgHYab1qFIkODnN-aVRUHWKC7Q5WaHruItSZ-Ex2QtLRrT7oRBd34vZglUzgD3KGrK8TQVBNMuk-HvUEFXVRQ4v4iQCeRSqE4lSEEeIptWyl3WTdTR0TFvffNeJmu6K6LUYMxMdNObf3o_i2n3VQ3PXVG9nA76pSO264k0s0BaeIfnDAK1WpI4U4G6CCNtc52hFYrD0rKfFrBlzBK9PDGLMuylkqiNBZjSJHcbyyKBwGexQ-n1yK",
];

export const mockSuites: SuiteDto[] = [
  makeSuite("suite-001", "#SU-201", "Heritage Suite", "SUITE", 1850, IMAGES[0]),
  makeSuite("suite-002", "#SU-202", "Sunrise Suite", "SUITE", 1700, IMAGES[1]),
  makeSuite("suite-003", "#SU-203", "Gallery Suite", "SUITE", 1650, IMAGES[2]),
  makeSuite(
    "suite-004",
    "#SU-204",
    "Riverside Suite",
    "SUITE",
    1750,
    IMAGES[3],
  ),
  makeSuite(
    "suite-005",
    "#SU-205",
    "Executive Suite",
    "SUITE",
    1900,
    IMAGES[4],
  ),
  makeSuite("suite-006", "#SU-206", "Grand Suite", "SUITE", 1980, IMAGES[0]),
  makeSuite(
    "suite-007",
    "#PH-01",
    "Royal Penthouse",
    "PENTHOUSE",
    2400,
    IMAGES[1],
  ),
  makeSuite(
    "suite-008",
    "#PH-02",
    "Crown Penthouse",
    "PENTHOUSE",
    2250,
    IMAGES[2],
  ),
  makeSuite(
    "suite-009",
    "#PH-03",
    "Aurora Penthouse",
    "PENTHOUSE",
    2100,
    IMAGES[3],
  ),
  makeSuite(
    "suite-010",
    "#PH-04",
    "Skyline Penthouse",
    "PENTHOUSE",
    2350,
    IMAGES[4],
  ),
  makeSuite(
    "suite-011",
    "#PH-05",
    "Imperial Penthouse",
    "PENTHOUSE",
    2500,
    IMAGES[0],
  ),
  makeSuite(
    "suite-012",
    "#PH-06",
    "Presidential Penthouse",
    "PENTHOUSE",
    2650,
    IMAGES[1],
  ),
  makeSuite(
    "suite-013",
    "#VL-301",
    "Sky Garden Villa",
    "VILLA",
    1200,
    IMAGES[2],
  ),
  makeSuite(
    "suite-014",
    "#VL-302",
    "Courtyard Villa",
    "VILLA",
    1280,
    IMAGES[3],
  ),
  makeSuite(
    "suite-015",
    "#VL-303",
    "Garden Terrace Villa",
    "VILLA",
    1350,
    IMAGES[4],
  ),
  makeSuite("suite-016", "#VL-304", "Lagoon Villa", "VILLA", 1420, IMAGES[0]),
  makeSuite("suite-017", "#VL-305", "Sunset Villa", "VILLA", 1500, IMAGES[1]),
  makeSuite("suite-018", "#VL-306", "Palm Villa", "VILLA", 1580, IMAGES[2]),
];

export const mockBookings: BookingDto[] = [
  {
    id: "booking-001",
    guestId: "guest-001",
    suiteId: "suite-001",
    checkInDate: iso(1),
    checkOutDate: iso(4),
    totalAmount: 5550,
    status: "CONFIRMED",
    paymentMethod: "CARD",
    paymentStatus: "PAID",
    checkedInAt: null,
    createdAt: iso(-2),
    updatedAt: iso(-1),
    suite: {
      id: "suite-001",
      name: "Heritage Suite",
      roomNumber: "#SU-201",
      pricePerNight: 1850,
    },
    guest: {
      id: "guest-001",
      firstName: "Liam",
      lastName: "Carter",
      email: "liam@example.com",
    },
  },
  {
    id: "booking-002",
    guestId: "guest-002",
    suiteId: "suite-009",
    checkInDate: iso(2),
    checkOutDate: iso(5),
    totalAmount: 6300,
    status: "PENDING",
    paymentMethod: null,
    paymentStatus: "UNPAID",
    checkedInAt: null,
    createdAt: iso(-1),
    updatedAt: iso(-1),
    suite: {
      id: "suite-009",
      name: "Aurora Penthouse",
      roomNumber: "#PH-03",
      pricePerNight: 2100,
    },
    guest: {
      id: "guest-002",
      firstName: "Sophia",
      lastName: "Nguyen",
      email: "sophia@example.com",
    },
  },
  {
    id: "booking-003",
    guestId: "guest-003",
    suiteId: "suite-014",
    checkInDate: iso(-3),
    checkOutDate: iso(1),
    totalAmount: 5120,
    status: "CONFIRMED",
    paymentMethod: "TRANSFER",
    paymentStatus: "PAID",
    checkedInAt: iso(-3),
    createdAt: iso(-6),
    updatedAt: iso(-3),
    suite: {
      id: "suite-014",
      name: "Courtyard Villa",
      roomNumber: "#VL-302",
      pricePerNight: 1280,
    },
    guest: {
      id: "guest-003",
      firstName: "Noah",
      lastName: "Patel",
      email: "noah@example.com",
    },
  },
];

export const mockUsers: StaffUserDto[] = [
  {
    id: "user-001",
    name: "Demo Admin",
    email: "demo@sunshine.local",
    role: "ADMIN",
    status: "ACTIVE",
    createdAt: iso(-30),
    updatedAt: iso(-1),
  },
  {
    id: "user-002",
    name: "Demo Manager",
    email: "manager@sunshine.local",
    role: "MANAGER",
    status: "ACTIVE",
    createdAt: iso(-20),
    updatedAt: iso(-1),
  },
  {
    id: "user-003",
    name: "Demo Staff",
    email: "staff@sunshine.local",
    role: "STAFF",
    status: "ACTIVE",
    createdAt: iso(-10),
    updatedAt: iso(-1),
  },
];

export const mockLedger: LedgerTransactionDto[] = [
  {
    id: "trx-001",
    transactionDate: iso(-2),
    amount: "5550",
    status: "COMPLETED",
    description: "Booking payment",
    bookingId: "booking-001",
    guestName: "Liam Carter",
    guestEmail: "liam@example.com",
    suiteName: "Heritage Suite",
    roomNumber: "#SU-201",
  },
  {
    id: "trx-002",
    transactionDate: iso(-3),
    amount: "5120",
    status: "COMPLETED",
    description: "Booking payment",
    bookingId: "booking-003",
    guestName: "Noah Patel",
    guestEmail: "noah@example.com",
    suiteName: "Courtyard Villa",
    roomNumber: "#VL-302",
  },
];

export const mockDashboard: AdminDashboardDto = {
  occupancyRate: 67.4,
  occupancyDeltaPct: 3.2,
  revpar: 1480,
  revparDeltaPct: 4.8,
  pendingActionsCount: 3,
  revenueMtd: 124500,
  revenueDeltaPct: 6.1,
  chart: Array.from({ length: 12 }).map((_, i) => ({
    day: i + 1,
    label: `4/${i + 1}`,
    revenue: 8000 + i * 700,
    occupancyPct: 52 + i,
    revenueNorm: (8000 + i * 700) / (8000 + 11 * 700),
    occupancyNorm: (52 + i) / 100,
  })),
  pendingBookings: mockBookings.map((b) => ({
    id: b.id,
    suiteLabel: `${b.suite.roomNumber} · ${b.suite.name}`,
    guestName: `${b.guest.firstName} ${b.guest.lastName}`,
    createdAt: b.createdAt,
    paymentStatus: b.paymentStatus,
    status: b.status,
    priority: b.paymentStatus === "UNPAID" ? "URGENT" : "STANDARD",
  })),
  todayArrivals: mockBookings.map((b) => ({
    bookingId: b.id,
    guestName: `${b.guest.firstName} ${b.guest.lastName}`,
    suiteName: b.suite.name,
    roomNumber: b.suite.roomNumber,
    checkInDate: b.checkInDate,
    status: b.status,
    paymentStatus: b.paymentStatus,
    checkedInAt: b.checkedInAt ?? null,
  })),
  meta: {
    totalSuites: 18,
    rentableSuites: 18,
    occupiedSuites: 12,
    asOf: new Date().toISOString(),
  },
};

export const mockArrivals: AdminArrivalsDto = {
  date: new Date().toISOString().slice(0, 10),
  arrivals: mockDashboard.todayArrivals,
};

export const mockNotifications: AdminNotificationsDto = {
  profile: {
    name: "Demo Admin",
    role: "ADMIN",
    email: "demo@sunshine.local",
  },
  items: [
    {
      id: "notif-001",
      kind: "BOOKING",
      message: "New booking request for Aurora Penthouse",
      createdAt: iso(-0.1),
      bookingId: "booking-002",
    },
    {
      id: "notif-002",
      kind: "PAYMENT",
      message: "Payment completed for Heritage Suite",
      createdAt: iso(-1),
      bookingId: "booking-001",
    },
  ],
  unreadCount: 2,
};
