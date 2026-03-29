import { IsEmail, IsIn, IsOptional, IsString, MinLength } from 'class-validator';
import {
  STAFF_ROLES,
  STAFF_USER_STATUSES,
} from '../constants/staff-user.constants';

export class CreateStaffUserDto {
  @IsString()
  @MinLength(1)
  name: string;

  @IsEmail()
  email: string;

  @IsString()
  @IsIn([...STAFF_ROLES])
  role: string;

  @IsOptional()
  @IsString()
  @IsIn([...STAFF_USER_STATUSES])
  status?: string;
}
