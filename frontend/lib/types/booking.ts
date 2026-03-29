export interface BookingDto {
  id: string;
  guestId: string;
  suiteId: string;
  checkInDate: string;
  checkOutDate: string;
  totalAmount: number;
  status: string;
  paymentMethod: string | null;
  paymentStatus: string;
  checkedInAt?: string | null;
  createdAt: string;
  updatedAt: string;
  suite: {
    id: string;
    name: string;
    roomNumber: string;
    pricePerNight: number;
  };
  guest: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
}
