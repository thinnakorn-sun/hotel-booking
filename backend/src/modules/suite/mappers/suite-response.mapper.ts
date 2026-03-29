import { Injectable } from '@nestjs/common';
import type { Suite } from '../../../prisma-client';
import type { SuiteResponse } from '../types/suite-response.type';

@Injectable()
export class SuiteResponseMapper {
  toResponse(row: Suite): SuiteResponse {
    return {
      ...row,
      pricePerNight: Number(row.pricePerNight),
    };
  }

  toResponseList(rows: Suite[]): SuiteResponse[] {
    return rows.map((row) => this.toResponse(row));
  }
}
