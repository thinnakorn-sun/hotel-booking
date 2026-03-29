export const PAYMENT_OPTIONS = [
  { code: 'CREDIT_DEBIT_CARD', label: 'Credit / debit card' },
  { code: 'BANK_TRANSFER', label: 'Bank transfer' },
  { code: 'PROMPTPAY_QR', label: 'PromptPay (QR)' },
  { code: 'TRUEMONEY_WALLET', label: 'TrueMoney Wallet' },
  { code: 'LINE_PAY', label: 'LINE Pay' },
  { code: 'SHOPEE_PAY', label: 'ShopeePay' },
  { code: 'PAYPAL', label: 'PayPal' },
  { code: 'APPLE_PAY', label: 'Apple Pay' },
  { code: 'GOOGLE_PAY', label: 'Google Pay' },
  { code: 'CASH_ON_CHECKIN', label: 'Pay at hotel (check-in)' },
] as const;

export type PaymentMethodCode = (typeof PAYMENT_OPTIONS)[number]['code'];
