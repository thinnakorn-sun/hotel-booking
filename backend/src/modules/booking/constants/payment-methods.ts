export const PAYMENT_METHOD_CODES = [
  'CREDIT_DEBIT_CARD',
  'BANK_TRANSFER',
  'PROMPTPAY_QR',
  'TRUEMONEY_WALLET',
  'LINE_PAY',
  'SHOPEE_PAY',
  'PAYPAL',
  'APPLE_PAY',
  'GOOGLE_PAY',
  'CASH_ON_CHECKIN',
] as const;

export type PaymentMethodCode = (typeof PAYMENT_METHOD_CODES)[number];
