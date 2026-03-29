import { IsEmail, IsIn, IsString } from 'class-validator';
import { PAYMENT_METHOD_CODES } from '../constants/payment-methods';

export class CompletePaymentDto {
  @IsString()
  @IsIn([...PAYMENT_METHOD_CODES])
  paymentMethod: string;

  @IsEmail()
  guestEmail: string;
}
