import { apiRequestJson, apiRequestJsonWithAuth } from "@/lib/api/client";
import { API_ENDPOINTS } from "@/lib/api/endpoints";
import { mockSuites } from "@/lib/demo/mock-data";
import {
  addMockSuite,
  getMockSuites,
  setMockSuiteStatus,
} from "@/lib/demo/mock-store";
import type { SuiteDto } from "@/lib/types/suite";
import type { SuiteStatusValue } from "@/lib/domain/suite-status";

export async function fetchSuites(): Promise<SuiteDto[]> {
  try {
    const data = await apiRequestJson<SuiteDto[]>(
      API_ENDPOINTS.suites,
      "Failed to load suites",
    );
    if (data.length > 0) return data;
  } catch {
    // fall through to demo data
  }
  const local = getMockSuites();
  return local.length > 0 ? local : mockSuites;
}

export async function fetchSuiteById(id: string): Promise<SuiteDto> {
  try {
    return await apiRequestJson<SuiteDto>(
      `${API_ENDPOINTS.suites}/${id}`,
      "Failed to load suite details",
    );
  } catch {
    const suite = getMockSuites().find((s) => s.id === id);
    if (suite) return suite;
    throw new Error("Failed to load suite details");
  }
}

export type FindAvailableSuitesParams = {
  checkInDate: string;
  checkOutDate: string;
  category?: string;
};

export async function fetchAvailableSuites(
  params: FindAvailableSuitesParams,
): Promise<SuiteDto[]> {
  const query = new URLSearchParams({
    checkInDate: params.checkInDate,
    checkOutDate: params.checkOutDate,
    ...(params.category ? { category: params.category } : {}),
  });
  try {
    const data = await apiRequestJson<SuiteDto[]>(
      `${API_ENDPOINTS.suitesAvailability}?${query.toString()}`,
      "Failed to load available suites",
    );
    if (data.length > 0) return data;
  } catch {
    // fall through to demo data
  }
  const category = params.category?.toUpperCase();
  return getMockSuites().filter(
    (s) =>
      s.status === "AVAILABLE" &&
      (!category || (s.category ?? "SUITE").toUpperCase() === category),
  );
}

export async function patchSuiteStatus(
  id: string,
  status: SuiteStatusValue,
): Promise<SuiteDto> {
  try {
    return await apiRequestJson<SuiteDto>(
      `${API_ENDPOINTS.suites}/${id}`,
      "Failed to update suite",
      {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      },
    );
  } catch {
    const updated = setMockSuiteStatus(id, status);
    if (!updated) throw new Error("Failed to update suite");
    return updated;
  }
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

export async function createSuite(body: CreateSuitePayload): Promise<SuiteDto> {
  try {
    return await apiRequestJsonWithAuth<SuiteDto>(
      API_ENDPOINTS.suites,
      "Could not create suite",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      },
    );
  } catch {
    return addMockSuite(body);
  }
}
