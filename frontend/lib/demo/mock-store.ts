import type { BookingDto } from "@/lib/types/booking";
import type { SuiteDto } from "@/lib/types/suite";
import { mockBookings, mockSuites } from "@/lib/demo/mock-data";

let suitesState: SuiteDto[] = [...mockSuites];
let bookingsState: BookingDto[] = [...mockBookings];

export function getMockSuites(): SuiteDto[] {
  return suitesState.map((s) => ({ ...s }));
}

export function getMockBookings(): BookingDto[] {
  return bookingsState.map((b) => ({ ...b }));
}

export function setMockSuiteStatus(
  id: string,
  status: string,
): SuiteDto | null {
  const idx = suitesState.findIndex((s) => s.id === id);
  if (idx < 0) return null;
  suitesState[idx] = {
    ...suitesState[idx],
    status,
    updatedAt: new Date().toISOString(),
  };
  return { ...suitesState[idx] };
}

export function addMockSuite(input: {
  name: string;
  roomNumber: string;
  description: string;
  pricePerNight: number;
  category?: string;
  imageUrl?: string | null;
}): SuiteDto {
  const suite: SuiteDto = {
    id: `suite-demo-${Date.now()}`,
    name: input.name,
    roomNumber: input.roomNumber,
    description: input.description,
    pricePerNight: input.pricePerNight,
    category: (input.category ?? "SUITE").toUpperCase(),
    status: "AVAILABLE",
    imageUrl: input.imageUrl ?? null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  suitesState = [suite, ...suitesState];
  return { ...suite };
}
