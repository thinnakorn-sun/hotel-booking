import { apiRequestJson, apiRequestJsonWithAuth } from '@/lib/api/client';
import { API_ENDPOINTS } from '@/lib/api/endpoints';
import type { SuiteDto } from '@/lib/types/suite';
import type { SuiteStatusValue } from '@/lib/domain/suite-status';

export async function fetchSuites(): Promise<SuiteDto[]> {
  return apiRequestJson<SuiteDto[]>(
    API_ENDPOINTS.suites,
    'Failed to load suites',
  );
}

export async function patchSuiteStatus(
  id: string,
  status: SuiteStatusValue,
): Promise<SuiteDto> {
  return apiRequestJson<SuiteDto>(
    `${API_ENDPOINTS.suites}/${id}`,
    'Failed to update suite',
    {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    },
  );
}

export type CreateSuitePayload = {
  name: string;
  roomNumber: string;
  description: string;
  pricePerNight: number;
  category?: string;
  status?: string;
  imageUrl?: string | null;
};

export async function createSuite(
  body: CreateSuitePayload,
): Promise<SuiteDto> {
  return apiRequestJsonWithAuth<SuiteDto>(API_ENDPOINTS.suites, 'Could not create suite', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
}
