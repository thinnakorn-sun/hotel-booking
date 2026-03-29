import { Type } from 'class-transformer';
import {
  IsIn,
  IsNumber,
  IsOptional,
  IsString,
  IsUrl,
  Min,
  ValidateIf,
} from 'class-validator';
import { SUITE_CATEGORIES } from '../constants/suite-category';
import { SUITE_STATUSES } from '../constants/suite-status';

export class CreateSuiteDto {
  @IsString()
  name: string;

  @IsString()
  roomNumber: string;

  @IsString()
  description: string;

  @Type(() => Number)
  @IsNumber()
  @Min(0)
  pricePerNight: number;

  @IsOptional()
  @IsString()
  @IsIn([...SUITE_STATUSES])
  status?: string;

  @IsOptional()
  @IsString()
  @IsIn([...SUITE_CATEGORIES])
  category?: string;

  @IsOptional()
  @ValidateIf((_, v) => v != null && v !== '')
  @IsUrl()
  imageUrl?: string | null;
}
