import { apiRequestJsonWithAuth } from '@/lib/api/client';
import { API_ENDPOINTS } from '@/lib/api/endpoints';
import type {
  AdminArrivalsDto,
  AdminDashboardDto,
  AdminNotificationsDto,
} from '@/lib/types/dashboard';

export async function fetchAdminDashboard(): Promise<AdminDashboardDto> {
  return apiRequestJsonWithAuth<AdminDashboardDto>(
    API_ENDPOINTS.adminDashboard,
    'Could not load dashboard',
  );
}

export async function fetchAdminArrivals(
  dateIso: string,
): Promise<AdminArrivalsDto> {
  const q = encodeURIComponent(dateIso);
  return apiRequestJsonWithAuth<AdminArrivalsDto>(
    `${API_ENDPOINTS.adminArrivals}?date=${q}`,
    'Could not load arrivals',
  );
}

export async function fetchAdminNotifications(
  sinceIso?: string | null,
): Promise<AdminNotificationsDto> {
  const path =
    sinceIso != null && sinceIso !== ''
      ? `${API_ENDPOINTS.adminNotifications}?since=${encodeURIComponent(sinceIso)}`
      : API_ENDPOINTS.adminNotifications;
  return apiRequestJsonWithAuth<AdminNotificationsDto>(
    path,
    'Could not load notifications',
  );
}
