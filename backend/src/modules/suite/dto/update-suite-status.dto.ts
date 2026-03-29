import { IsIn, IsString } from 'class-validator';
import { SUITE_STATUSES } from '../constants/suite-status';

export class UpdateSuiteStatusDto {
  @IsString()
  @IsIn([...SUITE_STATUSES])
  status: string;
}
