import { IsIn, IsOptional, IsString, MinLength } from 'class-validator';
import {
  STAFF_ROLES,
  STAFF_USER_STATUSES,
} from '../constants/staff-user.constants';

export class UpdateStaffUserDto {
  @IsOptional()
  @IsString()
  @MinLength(1)
  name?: string;

  @IsOptional()
  @IsString()
  @IsIn([...STAFF_ROLES])
  role?: string;

  @IsOptional()
  @IsString()
  @IsIn([...STAFF_USER_STATUSES])
  status?: string;
}
