import { apiRequestJsonWithAuth } from '@/lib/api/client';
import { API_ENDPOINTS } from '@/lib/api/endpoints';
import type { StaffUserDto } from '@/lib/types/staff-user';

export async function fetchAdminUsers(): Promise<StaffUserDto[]> {
  return apiRequestJsonWithAuth<StaffUserDto[]>(
    API_ENDPOINTS.usersAdminList,
    'Failed to load staff users',
  );
}

export type CreateStaffUserPayload = {
  name: string;
  email: string;
  role: string;
  status?: string;
};

export async function createAdminUser(
  body: CreateStaffUserPayload,
): Promise<StaffUserDto> {
  return apiRequestJsonWithAuth<StaffUserDto>(
    API_ENDPOINTS.usersAdmin,
    'Failed to create user',
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    },
  );
}

export type PatchStaffUserPayload = Partial<{
  name: string;
  role: string;
  status: string;
}>;

export async function patchAdminUser(
  id: string,
  body: PatchStaffUserPayload,
): Promise<StaffUserDto> {
  return apiRequestJsonWithAuth<StaffUserDto>(
    `${API_ENDPOINTS.usersAdmin}/${id}`,
    'Failed to update user',
    {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    },
  );
}
