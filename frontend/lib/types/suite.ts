export interface SuiteDto {
  id: string;
  name: string;
  roomNumber: string;
  description: string;
  pricePerNight: number;
  status: string;
  /** SUITE | PENTHOUSE | VILLA */
  category?: string;
  imageUrl: string | null;
  createdAt: string;
  updatedAt: string;
}
