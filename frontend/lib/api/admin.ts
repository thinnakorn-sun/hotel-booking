import { apiRequestJsonWithAuth } from "@/lib/api/client";
import { API_ENDPOINTS } from "@/lib/api/endpoints";
import {
  mockArrivals,
  mockDashboard,
  mockNotifications,
} from "@/lib/demo/mock-data";
import type {
  AdminArrivalsDto,
  AdminDashboardDto,
  AdminNotificationsDto,
} from "@/lib/types/dashboard";

export async function fetchAdminDashboard(): Promise<AdminDashboardDto> {
  try {
    return await apiRequestJsonWithAuth<AdminDashboardDto>(
      API_ENDPOINTS.adminDashboard,
      "Could not load dashboard",
    );
  } catch {
    return mockDashboard;
  }
}

export async function fetchAdminArrivals(
  dateIso: string,
): Promise<AdminArrivalsDto> {
  const q = encodeURIComponent(dateIso);
  try {
    return await apiRequestJsonWithAuth<AdminArrivalsDto>(
      `${API_ENDPOINTS.adminArrivals}?date=${q}`,
      "Could not load arrivals",
    );
  } catch {
    return { ...mockArrivals, date: dateIso };
  }
}

export async function fetchAdminNotifications(
  sinceIso?: string | null,
): Promise<AdminNotificationsDto> {
  const path =
    sinceIso != null && sinceIso !== ""
      ? `${API_ENDPOINTS.adminNotifications}?since=${encodeURIComponent(sinceIso)}`
      : API_ENDPOINTS.adminNotifications;
  try {
    return await apiRequestJsonWithAuth<AdminNotificationsDto>(
      path,
      "Could not load notifications",
    );
  } catch {
    return mockNotifications;
  }
}
