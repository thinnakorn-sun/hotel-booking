export interface LedgerTransactionDto {
  id: string;
  transactionDate: string;
  amount: string;
  status: string;
  description: string;
  bookingId: string;
  guestName: string;
  guestEmail: string;
  suiteName: string;
  roomNumber: string;
}
